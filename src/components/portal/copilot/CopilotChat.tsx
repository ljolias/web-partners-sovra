'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, StopCircle, Bot, User, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '@/components/ui';
import { useCopilot } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Deal, MEDDICScores, CopilotMessage } from '@/types';

interface CopilotChatProps {
  deal: Deal;
  onScoreUpdate: (scores: Partial<MEDDICScores>) => void;
}

export function CopilotChat({ deal, onScoreUpdate }: CopilotChatProps) {
  const t = useTranslations('copilot');
  const tMeddic = useTranslations('meddic');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    cancelRequest,
  } = useCopilot({
    dealId: deal.id,
    onScoreSuggestion: (scores) => {
      // Don't auto-apply, let user decide
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAcceptScore = (message: CopilotMessage) => {
    if (message.suggestedScores) {
      onScoreUpdate(message.suggestedScores);
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Bot className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('title')}</h3>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                  {/* Score Suggestion */}
                  {message.suggestedScores && Object.keys(message.suggestedScores).length > 0 && (
                    <div className="mt-3 rounded-lg bg-white p-3 shadow-sm">
                      <p className="mb-2 text-xs font-medium text-gray-500">
                        {t('scoreSuggestion')}
                      </p>
                      <div className="space-y-2">
                        {Object.entries(message.suggestedScores).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              {tMeddic(key as keyof MEDDICScores)}
                            </span>
                            <Badge variant="info">{value}/5</Badge>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptScore(message)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          {t('acceptScore')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="mr-1 h-3 w-3" />
                          {t('rejectScore')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500">{t('thinking')}</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {isLoading ? (
            <Button type="button" variant="outline" onClick={cancelRequest}>
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
