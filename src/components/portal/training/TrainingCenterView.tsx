'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SovraLoader } from '@/components/ui';
import { TrainingTabs } from './TrainingTabs';
import { CoursesList } from './CoursesList';
import { CertificationsList } from './CertificationsList';
import { LessonModal } from './LessonModal';
import { QuizModal } from './QuizModal';
import { logger } from '@/lib/logger';
import type {
  TrainingProgress,
  Certification,
  TrainingCourse,
  CourseModule,
  Lesson,
} from '@/types';

interface TrainingCenterViewProps {
  locale: string;
}

type TabType = 'modules' | 'certifications';

export function TrainingCenterView({ locale }: TrainingCenterViewProps) {
  const t = useTranslations('trainingCenter');
  const tCert = useTranslations('certifications');

  // State
  const [activeTab, setActiveTab] = useState<TabType>('modules');
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
  const [viewingModule, setViewingModule] = useState<CourseModule | null>(null);
  const [quizModule, setQuizModule] = useState<CourseModule | null>(null);
  const [currentCourse, setCurrentCourse] = useState<TrainingCourse | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, progressRes, certsRes] = await Promise.all([
          fetch('/api/partners/training/modules'),
          fetch('/api/partners/training/progress'),
          fetch('/api/partners/certifications'),
        ]);

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          logger.debug('Courses loaded', { count: coursesData.courses?.length });
          setCourses(coursesData.courses || []);
        } else {
          const error = await coursesRes.json();
          logger.error('Failed to load courses', { error });
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData.progress || {});
        } else {
          logger.error('Failed to load progress');
        }

        if (certsRes.ok) {
          const certsData = await certsRes.json();
          setCertifications(certsData.certifications || []);
        }
      } catch (error) {
        logger.error('Failed to fetch training center data', { error });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handlers
  const handleLessonClick = useCallback(
    (lesson: Lesson, module: CourseModule, course: TrainingCourse) => {
      setViewingLesson(lesson);
      setViewingModule(module);
      setCurrentCourse(course);
    },
    []
  );

  const handleQuizClick = useCallback(
    (module: CourseModule, course: TrainingCourse) => {
      setQuizModule(module);
      setViewingModule(module);
      setCurrentCourse(course);
    },
    []
  );

  const handleModuleContentCompleted = useCallback(() => {
    // Module content marked as complete
    logger.debug('Module content completed', { moduleId: viewingModule?.id });
  }, [viewingModule]);

  const handleShowQuizFromLesson = useCallback(() => {
    if (viewingModule) {
      setQuizModule(viewingModule);
      setViewingLesson(null);
    }
  }, [viewingModule]);

  const handleSubmitQuiz = useCallback(
    async (answers: number[]) => {
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
          logger.info('Quiz submitted successfully', {
            moduleId: quizModule.id,
            passed: data.passed,
            score: data.score,
          });
          return { passed: data.passed, score: data.score };
        }
      } catch (error) {
        logger.error('Failed to submit quiz', { error });
      }

      return null;
    },
    [quizModule]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {t('title')}
        </h1>
      </div>

      {/* Tabs */}
      <TrainingTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        modulesLabel={t('tabs.modules')}
        certificationsLabel={t('tabs.certifications')}
      />

      {/* Tab Content */}
      {activeTab === 'modules' && (
        <CoursesList
          courses={courses}
          onLessonClick={handleLessonClick}
          onQuizClick={handleQuizClick}
          locale={locale}
        />
      )}

      {activeTab === 'certifications' && (
        <CertificationsList
          certifications={certifications}
          locale={locale}
          tCert={tCert}
        />
      )}

      {/* Lesson Modal */}
      {viewingLesson && viewingModule && (
        <LessonModal
          lesson={viewingLesson}
          module={viewingModule}
          locale={locale}
          isOpen={!!viewingLesson}
          onClose={() => setViewingLesson(null)}
          onCompleted={handleModuleContentCompleted}
          onShowQuiz={handleShowQuizFromLesson}
        />
      )}

      {/* Quiz Modal */}
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
