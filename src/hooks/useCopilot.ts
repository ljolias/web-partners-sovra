'use client';

import { useState, useCallback, useRef } from 'react';
import type { CopilotMessage, MEDDICScores } from '@/types';

interface UseCopilotOptions {
  dealId: string;
  onScoreSuggestion?: (scores: Partial<MEDDICScores>) => void;
}

export function useCopilot({ dealId, onScoreSuggestion }: UseCopilotOptions) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startSession = useCallback(async () => {
    try {
      const res = await fetch('/api/partners/copilot/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId }),
      });

      if (!res.ok) throw new Error('Failed to start session');

      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages(data.messages || []);
      return data.sessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      return null;
    }
  }, [dealId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) {
        const newSessionId = await startSession();
        if (!newSessionId) return;
      }

      const userMessage: CopilotMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch('/api/partners/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            dealId,
            message: content,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error('Failed to send message');

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let assistantMessage: CopilotMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: fullContent } : msg
                    )
                  );
                }

                if (parsed.suggestedScores && onScoreSuggestion) {
                  onScoreSuggestion(parsed.suggestedScores);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, suggestedScores: parsed.suggestedScores }
                        : msg
                    )
                  );
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [sessionId, dealId, startSession, onScoreSuggestion]
  );

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    startSession,
    sendMessage,
    cancelRequest,
    clearMessages,
  };
}
