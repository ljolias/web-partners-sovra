'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TrainingCourse, TrainingProgress } from '@/types';

export function useTraining() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/partners/training/modules');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data.courses || []);
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
    fetchCourses();
    fetchProgress();
  }, [fetchCourses, fetchProgress]);

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

  const getTotalModuleCount = (): number => {
    return courses.reduce((total, course) => total + course.modules.length, 0);
  };

  const getOverallProgress = (): number => {
    const totalModules = getTotalModuleCount();
    if (totalModules === 0) return 0;
    return (getCompletedCount() / totalModules) * 100;
  };

  return {
    courses,
    progress,
    isLoading,
    error,
    fetchCourses,
    fetchProgress,
    startModule,
    submitQuiz,
    getModuleProgress,
    getCompletedCount,
    getTotalModuleCount,
    getOverallProgress,
  };
}
