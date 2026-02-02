import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getDeal,
  getCopilotSession,
  addCopilotMessage,
  getCopilotMessages,
  updateCopilotMeddic,
} from '@/lib/redis';
import { anthropic, MODEL, buildSystemPrompt, parseScoreSuggestions, cleanResponseContent } from '@/lib/claude';
import { logRatingEvent, recalculateAndUpdatePartner } from '@/lib/rating';
import type { CopilotMessage, CopilotSession } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    const { sessionId, dealId, message } = await request.json();

    if (!dealId || !message) {
      return new Response(JSON.stringify({ error: 'Deal ID and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const deal = await getDeal(dealId);

    if (!deal) {
      return new Response(JSON.stringify({ error: 'Deal not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (deal.partnerId !== partner.id) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!anthropic) {
      return new Response(JSON.stringify({ error: 'Copilot is not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get or verify session
    let session: CopilotSession | null = null;
    if (sessionId) {
      session = await getCopilotSession(sessionId);
    }

    // Get message history
    const previousMessages = session ? await getCopilotMessages(session.id) : [];

    // Add user message
    const userMessage: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    if (session) {
      await addCopilotMessage(session.id, userMessage);
    }

    // Get accept-language header for locale
    const acceptLanguage = request.headers.get('accept-language') || 'es';
    const locale = acceptLanguage.split(',')[0].split('-')[0];

    // Build system prompt
    const systemPrompt = buildSystemPrompt(deal, locale);

    // Build messages for Claude
    const claudeMessages = [
      ...previousMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic!.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system: systemPrompt,
            messages: claudeMessages,
            stream: true,
          });

          let fullContent = '';

          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullContent += text;

              // Send content chunk
              const data = JSON.stringify({ content: text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Parse score suggestions
          const suggestedScores = parseScoreSuggestions(fullContent);
          const cleanedContent = cleanResponseContent(fullContent);

          // Save assistant message
          const assistantMessage: CopilotMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: cleanedContent,
            suggestedScores: Object.keys(suggestedScores).length > 0 ? suggestedScores : undefined,
            createdAt: new Date().toISOString(),
          };

          if (session) {
            await addCopilotMessage(session.id, assistantMessage);

            // Save suggested scores
            if (Object.keys(suggestedScores).length > 0) {
              await updateCopilotMeddic(session.id, suggestedScores);
            }
          }

          // Send score suggestions if any
          if (Object.keys(suggestedScores).length > 0) {
            const scoreData = JSON.stringify({ suggestedScores });
            controller.enqueue(encoder.encode(`data: ${scoreData}\n\n`));
          }

          // Log copilot session completion event
          await logRatingEvent(
            partner.id,
            user.id,
            'COPILOT_SESSION_COMPLETED',
            { dealId, sessionId: session?.id }
          );

          // Recalculate rating in background (non-blocking)
          recalculateAndUpdatePartner(partner.id, user.id).catch(console.error);

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ error: 'Streaming failed' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Copilot chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
