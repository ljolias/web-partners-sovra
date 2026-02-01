'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Button, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TrainingModule, QuizQuestion } from '@/types';

interface QuizModalProps {
  module: TrainingModule;
  locale: string;
  onClose: () => void;
  onSubmit: (answers: number[]) => Promise<{ passed: boolean; score: number } | null>;
}

export function QuizModal({ module, locale, onClose, onSubmit }: QuizModalProps) {
  const t = useTranslations('training.quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(module.quiz.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);

  const question = module.quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / module.quiz.length) * 100;
  const allAnswered = answers.every((a) => a !== null);

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < module.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;

    setIsSubmitting(true);
    const res = await onSubmit(answers as number[]);
    setResult(res);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              {result.passed ? (
                <>
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {t('passed', { score: result.score })}
                  </h3>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto h-16 w-16 text-red-500" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {t('failed', { score: result.score, required: module.passingScore })}
                  </h3>
                </>
              )}
              <Button className="mt-6" onClick={onClose}>
                Close
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{t('question', { current: currentQuestion + 1, total: module.quiz.length })}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {question.question[locale] || question.question.en}
                  </h3>

                  <div className="space-y-3">
                    {(question.options[locale] || question.options.en).map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={cn(
                          'w-full rounded-lg border-2 p-4 text-left transition-colors',
                          answers[currentQuestion] === index
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="text-sm text-gray-900">{option}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            {currentQuestion < module.quiz.length - 1 ? (
              <Button onClick={handleNext} disabled={answers[currentQuestion] === null}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                isLoading={isSubmitting}
              >
                {t('submit')}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
