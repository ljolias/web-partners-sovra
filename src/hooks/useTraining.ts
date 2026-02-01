'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TrainingModule, TrainingProgress } from '@/types';

export function useTraining() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/partners/training/modules');
      if (!res.ok) throw new Error('Failed to fetch modules');
      const data = await res.json();
      setModules(data.modules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/partners/training/progress');
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();
      setProgress(data.progress || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    fetchModules();
    fetchProgress();
  }, [fetchModules, fetchProgress]);

  const startModule = async (moduleId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/partners/training/modules/${moduleId}/start`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to start module');

      const data = await res.json();
      setProgress((prev) => ({
        ...prev,
        [moduleId]: data.progress,
      }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const submitQuiz = async (
    moduleId: string,
    answers: number[]
  ): Promise<{ passed: boolean; score: number } | null> => {
    try {
      const res = await fetch('/api/partners/training/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, answers }),
      });

      if (!res.ok) throw new Error('Failed to submit quiz');

      const data = await res.json();
      setProgress((prev) => ({
        ...prev,
        [moduleId]: data.progress,
      }));
      return { passed: data.passed, score: data.score };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const getModuleProgress = (moduleId: string): TrainingProgress | undefined => {
    return progress[moduleId];
  };

  const getCompletedCount = (): number => {
    return Object.values(progress).filter((p) => p.completed).length;
  };

  const getOverallProgress = (): number => {
    if (modules.length === 0) return 0;
    return (getCompletedCount() / modules.length) * 100;
  };

  return {
    modules,
    progress,
    isLoading,
    error,
    fetchModules,
    fetchProgress,
    startModule,
    submitQuiz,
    getModuleProgress,
    getCompletedCount,
    getOverallProgress,
  };
}
