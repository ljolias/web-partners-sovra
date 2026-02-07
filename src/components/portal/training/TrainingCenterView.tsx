'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Calendar, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrainingModules } from './TrainingModules';
import { ModuleContentView } from './ModuleContentView';
import { LessonContentView } from './LessonContentView';
import { QuizModal } from './QuizModal';
import { Card, CardContent, Badge, SovraLoader, Button } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import type { TrainingProgress, Certification, CertificationType, TrainingCourse } from '@/types';

interface TrainingCenterViewProps {
  locale: string;
}

type TabType = 'modules' | 'certifications';

export function TrainingCenterView({ locale }: TrainingCenterViewProps) {
  const t = useTranslations('trainingCenter');
  const tCert = useTranslations('certifications');
  const [activeTab, setActiveTab] = useState<TabType>('modules');
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingLesson, setViewingLesson] = useState<any | null>(null);
  const [viewingModule, setViewingModule] = useState<any | null>(null);
  const [quizModule, setQuizModule] = useState<any | null>(null);
  const [currentCourse, setCurrentCourse] = useState<any | null>(null);

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
          console.log('Courses loaded:', coursesData.courses);
          setCourses(coursesData.courses || []);
        } else {
          const error = await coursesRes.json();
          console.error('Failed to load courses:', error);
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData.progress || {});
        } else {
          console.error('Failed to load progress');
        }

        if (certsRes.ok) {
          const certsData = await certsRes.json();
          setCertifications(certsData.certifications || []);
        }
      } catch (error) {
        console.error('Failed to fetch training center data:', error);
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

        // Find the module across all courses
        for (const course of courses) {
          const module = course.modules.find((m: any) => m.id === moduleId);
          if (module) {
            setViewingModule(module);
            setCurrentCourse(course);
            break;
          }
        }
      } else {
        const error = await res.json();
        console.error('Failed to start module:', error);
        alert(`Error: ${error.error || 'Failed to start module'}`);
      }
    } catch (error) {
      console.error('Failed to start module:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleModuleContentCompleted = () => {
    // Module content marked as complete, now offer quiz
    if (viewingModule && viewingModule.quiz && viewingModule.quiz.length > 0) {
      // User will click "Take Quiz" button in ModuleContentView
    }
  };

  const handleTakeQuizFromContent = () => {
    if (viewingModule) {
      setQuizModule(viewingModule);
    }
  };

  const handleTakeQuiz = (moduleId: string) => {
    for (const course of courses) {
      const module = course.modules.find((m: any) => m.id === moduleId);
      if (module) {
        setQuizModule(module);
        setCurrentCourse(course);
        break;
      }
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
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  const activeCerts = certifications.filter(
    (c) => c.status === 'active' && new Date(c.expiresAt) > new Date()
  );
  const expiredCerts = certifications.filter(
    (c) => c.status !== 'active' || new Date(c.expiresAt) <= new Date()
  );
  const certTypes: CertificationType[] = ['sales_fundamentals', 'technical_specialist', 'solution_architect'];

  const tabs: { id: TabType; label: string; icon: typeof GraduationCap }[] = [
    { id: 'modules', label: t('tabs.modules'), icon: GraduationCap },
    { id: 'certifications', label: t('tabs.certifications'), icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'modules' && (
        <div className="space-y-8">
          {courses.map((course: TrainingCourse) => (
            <div key={course.id} className="space-y-4">
              {/* Course Header */}
              <div className="border-b-2 border-[var(--color-border)] pb-4">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {course.title.es || course.title.en}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                  {course.description?.es || course.description?.en}
                </p>
                <div className="mt-3 flex gap-4 text-xs text-[var(--color-text-secondary)]">
                  <span>📚 {course.modules.length} módulos</span>
                  <span>⏱ {course.duration} minutos</span>
                </div>
              </div>

              {/* Modules and Lessons */}
              <div className="space-y-4">
                {course.modules.map((module: any, moduleIdx: number) => (
                  <div key={module.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                    {/* Module Header */}
                    <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Módulo {moduleIdx + 1}: {module.title.es || module.title.en}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          {module.description.es || module.description.en}
                        </p>
                      )}
                    </div>

                    {/* Lessons in Module */}
                    <div className="p-4 space-y-3">
                      {module.lessons && module.lessons.length > 0 ? (
                        <>
                          <div className="space-y-2">
                            {module.lessons.map((lesson: any, lessonIdx: number) => (
                              <button
                                key={lesson.id}
                                onClick={() => {
                                  setViewingLesson(lesson);
                                  setViewingModule(module);
                                  setCurrentCourse(course);
                                }}
                                className="w-full p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)] transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    {lessonIdx + 1}.
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      {lesson.type === 'video' && <span>🎥</span>}
                                      {lesson.type === 'reading' && <span>📖</span>}
                                      {lesson.type === 'download' && <span>📥</span>}
                                      <span className="font-medium text-[var(--color-text-primary)]">
                                        {lesson.title.es || lesson.title.en}
                                      </span>
                                    </div>
                                    <span className="text-xs text-[var(--color-text-secondary)] mt-1 block">
                                      ⏱ {lesson.duration} minutos • {lesson.type === 'video' ? 'Video' : lesson.type === 'reading' ? 'Lectura' : 'Descarga'}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Quiz for Module */}
                          {module.quiz && module.quiz.length > 0 && (
                            <button
                              onClick={() => {
                                setViewingModule(module);
                                setCurrentCourse(course);
                                setQuizModule(module);
                              }}
                              className="w-full p-3 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-colors text-left mt-4"
                            >
                              <div className="flex items-center gap-3">
                                <span>📝</span>
                                <div className="flex-1">
                                  <div className="font-medium text-[var(--color-text-primary)]">
                                    Quiz del Módulo
                                  </div>
                                  <span className="text-xs text-[var(--color-text-secondary)]">
                                    {module.quiz.length} preguntas • Puntuación requerida: {module.passingScore || 70}%
                                  </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
                              </div>
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[var(--color-text-secondary)] py-4">
                          No hay clases en este módulo
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="space-y-8">
          {/* Active Certifications */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">{tCert('active')}</h2>
            {activeCerts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeCerts.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[var(--color-text-primary)]">
                                {tCert(`types.${cert.type}`)}
                              </h3>
                              <Badge variant="success">Active</Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                              <Calendar className="h-4 w-4" />
                              {tCert('validUntil', { date: formatDate(cert.expiresAt, locale) })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
                  <p className="mt-4 text-[var(--color-text-secondary)]">No active certifications</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Available Certifications */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Available Certifications</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certTypes.map((type, index) => {
                const hasCert = activeCerts.some((c) => c.type === type);

                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={hasCert ? 'opacity-60' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                              hasCert ? 'bg-green-100 dark:bg-green-900/30' : 'bg-[var(--color-surface-hover)]'
                            }`}
                          >
                            {hasCert ? (
                              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <Award className="h-6 w-6 text-[var(--color-text-secondary)]" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--color-text-primary)]">{tCert(`types.${type}`)}</h3>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                              {hasCert ? 'Earned' : tCert('earn')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Expired Certifications */}
          {expiredCerts.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">{tCert('expired')}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expiredCerts.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="opacity-60">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-surface-hover)]">
                            <Award className="h-6 w-6 text-[var(--color-text-secondary)]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[var(--color-text-primary)]">
                                {tCert(`types.${cert.type}`)}
                              </h3>
                              <Badge variant="danger">{tCert('expired')}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                              Expired on {formatDate(cert.expiresAt, locale)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lesson Content View Modal */}
      {viewingLesson && viewingModule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <LessonContentView
                lesson={viewingLesson}
                module={viewingModule}
                locale={locale}
                onCompleted={handleModuleContentCompleted}
                onShowQuiz={() => {
                  setQuizModule(viewingModule);
                  setViewingLesson(null);
                }}
                onBack={() => setViewingLesson(null)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

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
