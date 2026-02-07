'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  BookOpen,
  HelpCircle,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import { LessonListEditor } from './LessonListEditor';
import { LessonEditorModal } from './LessonEditorModal';
import { QuizSection } from './QuizSection';
import type { CourseModule, Lesson, CourseQuizQuestion, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface ModuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (module: CourseModule) => void;
  module?: CourseModule;
  order: number;
}

type TabType = 'content' | 'quiz';

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// Constants
// ============================================

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'content', label: 'Contenido', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
];

// ============================================
// Initial State
// ============================================

const getInitialModuleState = (order: number): CourseModule => ({
  id: `module_${Date.now()}`,
  title: { es: '', en: '', pt: '' },
  description: { es: '', en: '', pt: '' },
  lessons: [],
  quiz: [],
  passingScore: 70,
  order,
});

// ============================================
// Main Component
// ============================================

export function ModuleEditorModal({
  isOpen,
  onClose,
  onSave,
  module,
  order,
}: ModuleEditorModalProps) {
  // State
  const [currentModule, setCurrentModule] = useState<CourseModule>(
    module || getInitialModuleState(order)
  );
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  // Lesson editor modal state
  const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);

  // Reset state when module changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentModule(module || getInitialModuleState(order));
      setErrors({});
      setActiveTab('content');
    }
  }, [isOpen, module, order]);

  // Calculate total duration from lessons
  useEffect(() => {
    if (currentModule.lessons.length > 0) {
      const totalDuration = currentModule.lessons.reduce((acc, lesson) => acc + lesson.duration, 0);
      setCurrentModule((prev) => ({ ...prev, duration: totalDuration }));
    }
  }, [currentModule.lessons]);

  // ============================================
  // Form Handlers
  // ============================================

  const handleTitleChange = (value: LocalizedString) => {
    setCurrentModule((prev) => ({ ...prev, title: value }));
    if (errors['title.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['title.es'];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (value: LocalizedString) => {
    setCurrentModule((prev) => ({ ...prev, description: value }));
  };

  const handleLessonsChange = (lessons: Lesson[]) => {
    setCurrentModule((prev) => ({ ...prev, lessons }));
  };

  const handleQuizChange = (quiz: CourseQuizQuestion[]) => {
    setCurrentModule((prev) => ({ ...prev, quiz }));
  };

  const handlePassingScoreChange = (score: number) => {
    setCurrentModule((prev) => ({ ...prev, passingScore: score }));
  };

  // ============================================
  // Lesson Handlers
  // ============================================

  const handleAddLesson = () => {
    setEditingLesson(undefined);
    setIsLessonEditorOpen(true);
  };

  const handleEditLesson = (lessonId: string) => {
    const lesson = currentModule.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setEditingLesson(lesson);
      setIsLessonEditorOpen(true);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    const updatedLessons = currentModule.lessons
      .filter((l) => l.id !== lessonId)
      .map((l, index) => ({ ...l, order: index + 1 }));
    handleLessonsChange(updatedLessons);
  };

  const handleSaveLesson = (lesson: Lesson) => {
    if (editingLesson) {
      // Update existing lesson
      const updatedLessons = currentModule.lessons.map((l) =>
        l.id === lesson.id ? lesson : l
      );
      handleLessonsChange(updatedLessons);
    } else {
      // Add new lesson
      const newLesson = {
        ...lesson,
        order: currentModule.lessons.length + 1,
      };
      handleLessonsChange([...currentModule.lessons, newLesson]);
    }
    setIsLessonEditorOpen(false);
    setEditingLesson(undefined);
  };

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!currentModule.title?.es || currentModule.title.es.trim() === '') {
      newErrors['title.es'] = 'El título en español es requerido';
    }

    // Lessons validation
    if (currentModule.lessons.length === 0) {
      newErrors.lessons = 'Debes agregar al menos una clase al módulo';
    }

    // Quiz validation
    if (currentModule.quiz && currentModule.quiz.length > 0) {
      // Validate that all questions have at least 2 options
      currentModule.quiz.forEach((question, index) => {
        if (!question.question.es || question.question.es.trim() === '') {
          newErrors[`quiz.${index}.question`] = `La pregunta ${index + 1} requiere texto en español`;
        }
        if (question.options.length < 2) {
          newErrors[`quiz.${index}.options`] = `La pregunta ${index + 1} debe tener al menos 2 opciones`;
        }
        question.options.forEach((option, optionIndex) => {
          if (!option.es || option.es.trim() === '') {
            newErrors[`quiz.${index}.option.${optionIndex}`] = `Opción ${optionIndex + 1} de pregunta ${index + 1} vacía`;
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Form Submission
  // ============================================

  const handleSave = () => {
    if (!validate()) {
      // Switch to the tab with errors
      if (errors['title.es'] || errors.lessons) {
        setActiveTab('content');
      } else {
        setActiveTab('quiz');
      }
      return;
    }

    setSaving(true);

    // Simulate async operation
    setTimeout(() => {
      onSave(currentModule);
      setSaving(false);
      handleClose();
    }, 300);
  };

  // ============================================
  // Reset & Close
  // ============================================

  const handleClose = () => {
    setCurrentModule(getInitialModuleState(order));
    setErrors({});
    setActiveTab('content');
    setEditingLesson(undefined);
    setIsLessonEditorOpen(false);
    onClose();
  };

  // ============================================
  // Render
  // ============================================

  if (!isOpen) return null;

  const inputClasses = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors';
  const labelClasses = 'block text-sm font-medium text-[var(--color-text-primary)] mb-1';

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {module ? 'Editar Módulo' : 'Nuevo Módulo'}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {module ? 'Modifica el contenido del módulo' : 'Crea un nuevo módulo con clases y quiz'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)]">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative
                    ${activeTab === tab.id
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'quiz' && currentModule.quiz && currentModule.quiz.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--color-primary)] text-white rounded-full">
                      {currentModule.quiz.length}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeModuleTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
              {/* Validation Errors */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-500">
                      Hay errores en el formulario
                    </p>
                    <ul className="text-sm text-red-500/80 mt-1 space-y-1">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab: Content */}
              {activeTab === 'content' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <MultiLangInput
                    label="Título del Módulo"
                    value={currentModule.title}
                    onChange={handleTitleChange}
                    required
                    placeholder={{ es: 'Fundamentos del producto', en: 'Product fundamentals', pt: 'Fundamentos do produto' }}
                    error={errors['title.es']}
                  />

                  {/* Description */}
                  <MultiLangInput
                    label="Descripción"
                    value={currentModule.description || { es: '', en: '', pt: '' }}
                    onChange={handleDescriptionChange}
                    type="textarea"
                    placeholder={{ es: 'Describe lo que aprenderán...', en: 'Describe what they will learn...', pt: 'Descreva o que eles aprenderão...' }}
                  />

                  {/* Lessons */}
                  <LessonListEditor
                    lessons={currentModule.lessons}
                    onChange={handleLessonsChange}
                    onAddLesson={handleAddLesson}
                    onEditLesson={handleEditLesson}
                    onDeleteLesson={handleDeleteLesson}
                  />
                </motion.div>
              )}

              {/* Tab: Quiz */}
              {activeTab === 'quiz' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <QuizSection
                    questions={currentModule.quiz || []}
                    onChange={handleQuizChange}
                    passingScore={currentModule.passingScore || 70}
                    onPassingScoreChange={handlePassingScoreChange}
                  />
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="text-xs text-[var(--color-text-secondary)]">
                {currentModule.lessons.length} clase{currentModule.lessons.length !== 1 ? 's' : ''}
                {currentModule.quiz && currentModule.quiz.length > 0 && (
                  <> • {currentModule.quiz.length} pregunta{currentModule.quiz.length !== 1 ? 's' : ''} de quiz</>
                )}
                {currentModule.duration && (
                  <> • {currentModule.duration} min totales</>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {module ? 'Guardar Cambios' : 'Crear Módulo'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Lesson Editor Modal */}
      <LessonEditorModal
        isOpen={isLessonEditorOpen}
        onClose={() => {
          setIsLessonEditorOpen(false);
          setEditingLesson(undefined);
        }}
        onSave={handleSaveLesson}
        lesson={editingLesson}
        order={editingLesson?.order || currentModule.lessons.length + 1}
      />
    </>
  );
}
