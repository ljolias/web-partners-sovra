import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';

/**
 * GET /api/sovra/webhooks/sovraid/test
 *
 * Returns webhook configuration info for debugging
 */
export async function GET() {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can check this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://web-partners-sovra.vercel.app'}/api/sovra/webhooks/sovraid`;
    const hasSecret = !!process.env.SOVRAID_WEBHOOK_SECRET;

    return NextResponse.json({
      webhookUrl,
      secretConfigured: hasSecret,
      events: [
        'credential.claimed',
        'credential.revoked',
        'verification.completed',
      ],
      instructions: {
        step1: 'Configura este URL en el dashboard de SovraID como webhook URL',
        step2: 'Suscríbete a los eventos: credential.claimed, credential.revoked',
        step3: 'Copia el webhook secret y agrégalo como SOVRAID_WEBHOOK_SECRET en Vercel',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/sovra/webhooks/sovraid/test
 *
 * Simulates a webhook event for testing (only in development)
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can test
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint only available in development' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { credentialId, event } = body;

    if (!credentialId || !event) {
      return NextResponse.json(
        { error: 'credentialId and event are required' },
        { status: 400 }
      );
    }

    // Forward to the actual webhook handler
    const webhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: {
        id: credentialId,
        holderDid: 'did:test:simulated',
        claimedAt: new Date().toISOString(),
      },
    };

    const webhookResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sovra/webhooks/sovraid`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sovraid-signature': process.env.SOVRAID_WEBHOOK_SECRET || 'test-secret',
        },
        body: JSON.stringify(webhookPayload),
      }
    );

    const result = await webhookResponse.json();

    return NextResponse.json({
      success: webhookResponse.ok,
      message: webhookResponse.ok
        ? 'Webhook test successful - credential status updated'
        : 'Webhook test failed',
      result,
    });
  } catch (error) {
    console.error('[Webhook Test] Error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
