import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { TrainingCourse, CourseModule, Lesson } from '@/types';

interface CoursesListProps {
  courses: TrainingCourse[];
  onLessonClick: (lesson: Lesson, module: CourseModule, course: TrainingCourse) => void;
  onQuizClick: (module: CourseModule, course: TrainingCourse) => void;
  locale: string;
}

export const CoursesList = React.memo(function CoursesList({
  courses,
  onLessonClick,
  onQuizClick,
  locale,
}: CoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-text-secondary)]">
        No hay cursos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {courses.map((course) => (
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
            {course.modules.map((module, moduleIdx) => (
              <div
                key={module.id}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden"
              >
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
                        {module.lessons.map((lesson, lessonIdx) => (
                          <button
                            key={lesson.id}
                            onClick={() => onLessonClick(lesson, module, course)}
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
                                  ⏱ {lesson.duration} minutos •{' '}
                                  {lesson.type === 'video'
                                    ? 'Video'
                                    : lesson.type === 'reading'
                                    ? 'Lectura'
                                    : 'Descarga'}
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
                          onClick={() => onQuizClick(module, course)}
                          className="w-full p-3 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-colors text-left mt-4"
                        >
                          <div className="flex items-center gap-3">
                            <span>📝</span>
                            <div className="flex-1">
                              <div className="font-medium text-[var(--color-text-primary)]">
                                Quiz del Módulo
                              </div>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {module.quiz.length} preguntas • Puntuación requerida:{' '}
                                {module.passingScore || 70}%
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
  );
});
