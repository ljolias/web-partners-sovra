'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { TrainingModules } from '@/components/portal/training/TrainingModules';
import { QuizModal } from '@/components/portal/training/QuizModal';
import type { TrainingModule, TrainingProgress } from '@/types';

interface TrainingPageProps {
  params: Promise<{ locale: string }>;
}

export default function TrainingPage({ params }: TrainingPageProps) {
  const { locale } = use(params);
  const t = useTranslations('training');
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [quizModule, setQuizModule] = useState<TrainingModule | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesRes, progressRes] = await Promise.all([
          fetch('/api/partners/training/modules'),
          fetch('/api/partners/training/progress'),
        ]);

        if (modulesRes.ok && progressRes.ok) {
          const modulesData = await modulesRes.json();
          const progressData = await progressRes.json();
          setModules(modulesData.modules || []);
          setProgress(progressData.progress || {});
        }
      } catch (error) {
        console.error('Failed to fetch training data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStartModule = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/partners/training/modules/${moduleId}/start`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setProgress((prev) => ({
          ...prev,
          [moduleId]: data.progress,
        }));

        // Open quiz immediately after starting
        const module = modules.find((m) => m.id === moduleId);
        if (module) {
          setQuizModule(module);
        }
      }
    } catch (error) {
      console.error('Failed to start module:', error);
    }
  };

  const handleTakeQuiz = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      setQuizModule(module);
    }
  };

  const handleSubmitQuiz = async (answers: number[]) => {
    if (!quizModule) return null;

    try {
      const res = await fetch('/api/partners/training/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: quizModule.id,
          answers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProgress((prev) => ({
          ...prev,
          [quizModule.id]: data.progress,
        }));
        return { passed: data.passed, score: data.score };
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      <TrainingModules
        modules={modules}
        progress={progress}
        locale={locale}
        onStartModule={handleStartModule}
        onTakeQuiz={handleTakeQuiz}
      />

      {quizModule && (
        <QuizModal
          module={quizModule}
          locale={locale}
          onClose={() => setQuizModule(null)}
          onSubmit={handleSubmitQuiz}
        />
      )}
    </div>
  );
}
