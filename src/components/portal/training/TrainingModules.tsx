'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { Button, Card, Progress, Badge } from '@/components/ui';
import type { TrainingModule, TrainingProgress } from '@/types';

interface TrainingModulesProps {
  modules: TrainingModule[];
  progress: Record<string, TrainingProgress>;
  locale: string;
  onStartModule: (moduleId: string) => void;
  onTakeQuiz: (moduleId: string) => void;
}

export function TrainingModules({
  modules,
  progress,
  locale,
  onStartModule,
  onTakeQuiz,
}: TrainingModulesProps) {
  const t = useTranslations('training');

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const overallProgress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{t('progress')}</h3>
            <p className="text-sm text-gray-500">
              {completedCount} / {modules.length} modules completed
            </p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {Math.round(overallProgress)}%
          </div>
        </div>
        <Progress value={overallProgress} className="mt-4" />
      </Card>

      {/* Modules List */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('modules')}</h2>
        <div className="space-y-4">
          {modules.map((module, index) => {
            const moduleProgress = progress[module.id];
            const isCompleted = moduleProgress?.completed;
            const hasStarted = !!moduleProgress;
            const quizScore = moduleProgress?.quizScore;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <BookOpen className="h-6 w-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {module.title[locale] || module.title.en}
                      </h3>
                      {isCompleted && (
                        <Badge variant="success">{t('module.completed')}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {module.description[locale] || module.description.en}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('module.duration', { minutes: module.duration })}
                      </span>
                      <span>{t('module.passingScore', { score: module.passingScore })}</span>
                    </div>
                    {quizScore !== null && quizScore !== undefined && !isCompleted && (
                      <p className="mt-2 text-sm text-amber-600">
                        {t('module.quizFailed', { score: quizScore })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <Badge variant="success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t('module.quizPassed')}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => onStartModule(module.id)}>
                        <Play className="mr-1 h-4 w-4" />
                        {hasStarted ? 'Ver Contenido' : t('module.start')}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
