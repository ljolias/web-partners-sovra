'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Video,
  BookOpen,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import { MultiLangTipTap } from './MultiLangTipTap';
import type { Lesson, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface LessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
  lesson?: Lesson; // Optional - for editing existing lesson
  order: number; // Order in the module
}

type LessonType = 'video' | 'reading' | 'download';

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// Constants
// ============================================

const LESSON_TYPE_OPTIONS: Array<{ value: LessonType; label: string; icon: React.ReactNode }> = [
  { value: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { value: 'reading', label: 'Lectura', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'download', label: 'Descarga', icon: <Download className="w-4 h-4" /> },
];

// ============================================
// Initial State
// ============================================

const getInitialLessonState = (order: number): Lesson => ({
  id: `lesson_${Date.now()}`,
  title: { es: '', en: '', pt: '' },
  type: 'video',
  duration: 15,
  order,
});

// ============================================
// Main Component
// ============================================

export function LessonEditorModal({
  isOpen,
  onClose,
  onSave,
  lesson,
  order,
}: LessonEditorModalProps) {
  // State
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    lesson || getInitialLessonState(order)
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  // Reset state when lesson changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentLesson(lesson || getInitialLessonState(order));
      setErrors({});
    }
  }, [isOpen, lesson, order]);

  // ============================================
  // Form Handlers
  // ============================================

  const handleTitleChange = (value: LocalizedString) => {
    setCurrentLesson((prev) => ({ ...prev, title: value }));
    if (errors['title.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['title.es'];
        return newErrors;
      });
    }
  };

  const handleTypeChange = (type: LessonType) => {
    setCurrentLesson((prev) => {
      // Clear type-specific fields when changing type
      const updated: Lesson = {
        ...prev,
        type,
      };

      // Remove fields from other types
      if (type !== 'video') {
        delete updated.videoUrl;
      }
      if (type !== 'reading') {
        delete updated.content;
      }
      if (type !== 'download') {
        delete updated.downloadUrl;
      }

      return updated;
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(240, parseInt(e.target.value) || 1));
    setCurrentLesson((prev) => ({ ...prev, duration: value }));
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLesson((prev) => ({ ...prev, videoUrl: e.target.value }));
    if (errors.videoUrl) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.videoUrl;
        return newErrors;
      });
    }
  };

  const handleContentChange = (value: LocalizedString) => {
    setCurrentLesson((prev) => ({ ...prev, content: value }));
    if (errors['content.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['content.es'];
        return newErrors;
      });
    }
  };

  const handleDownloadUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLesson((prev) => ({ ...prev, downloadUrl: e.target.value }));
    if (errors.downloadUrl) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.downloadUrl;
        return newErrors;
      });
    }
  };

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!currentLesson.title?.es || currentLesson.title.es.trim() === '') {
      newErrors['title.es'] = 'El titulo en español es requerido';
    }

    // Duration validation
    if (!currentLesson.duration || currentLesson.duration < 1) {
      newErrors.duration = 'La duración debe ser mayor a 0';
    }

    // Type-specific validation
    if (currentLesson.type === 'video') {
      if (!currentLesson.videoUrl || currentLesson.videoUrl.trim() === '') {
        newErrors.videoUrl = 'La URL del video es requerida';
      }
    } else if (currentLesson.type === 'reading') {
      if (!currentLesson.content?.es || currentLesson.content.es.trim() === '') {
        newErrors['content.es'] = 'El contenido en español es requerido';
      }
    } else if (currentLesson.type === 'download') {
      if (!currentLesson.downloadUrl || currentLesson.downloadUrl.trim() === '') {
        newErrors.downloadUrl = 'La URL de descarga es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Form Submission
  // ============================================

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    setSaving(true);

    // Simulate async operation
    setTimeout(() => {
      onSave(currentLesson);
      setSaving(false);
      handleClose();
    }, 300);
  };

  // ============================================
  // Reset & Close
  // ============================================

  const handleClose = () => {
    setCurrentLesson(getInitialLessonState(order));
    setErrors({});
    onClose();
  };

  // ============================================
  // Render
  // ============================================

  if (!isOpen) return null;

  const inputClasses = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors';
  const labelClasses = 'block text-sm font-medium text-[var(--color-text-primary)] mb-1';

  return (
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
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {lesson ? 'Editar Clase' : 'Nueva Clase'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {lesson ? 'Modifica los detalles de la clase' : 'Crea una nueva clase para el módulo'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              {/* Title */}
              <MultiLangInput
                label="Título de la Clase"
                value={currentLesson.title}
                onChange={handleTitleChange}
                required
                placeholder={{ es: 'Introducción al producto', en: 'Product Introduction', pt: 'Introdução ao produto' }}
                error={errors['title.es']}
              />

              {/* Type Selection */}
              <div>
                <label className={labelClasses}>
                  Tipo de Clase <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {LESSON_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTypeChange(option.value)}
                      className={`
                        flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all
                        ${currentLesson.type === option.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 text-[var(--color-text-secondary)]'
                        }
                      `}
                    >
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className={labelClasses}>
                  Duración (minutos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={currentLesson.duration}
                  onChange={handleDurationChange}
                  className={inputClasses}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Type-specific content */}
              {currentLesson.type === 'video' && (
                <div>
                  <label className={labelClasses}>
                    URL del Video <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={currentLesson.videoUrl || ''}
                    onChange={handleVideoUrlChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={inputClasses}
                  />
                  {errors.videoUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.videoUrl}</p>
                  )}
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Soporta YouTube, Vimeo, y otras plataformas de video
                  </p>
                </div>
              )}

              {currentLesson.type === 'reading' && (
                <div>
                  <label className={labelClasses}>
                    Contenido <span className="text-red-500">*</span>
                  </label>
                  <MultiLangTipTap
                    value={currentLesson.content || { es: '', en: '', pt: '' }}
                    onChange={handleContentChange}
                    placeholder={{
                      es: 'Escribe el contenido de lectura aquí...',
                      en: 'Write the reading content here...',
                      pt: 'Escreva o conteúdo de leitura aqui...',
                    }}
                  />
                  {errors['content.es'] && (
                    <p className="text-sm text-red-500 mt-1">{errors['content.es']}</p>
                  )}
                </div>
              )}

              {currentLesson.type === 'download' && (
                <div>
                  <label className={labelClasses}>
                    URL de Descarga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={currentLesson.downloadUrl || ''}
                    onChange={handleDownloadUrlChange}
                    placeholder="https://ejemplo.com/archivo.pdf"
                    className={inputClasses}
                  />
                  {errors.downloadUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.downloadUrl}</p>
                  )}
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    URL del archivo que los usuarios podrán descargar (PDF, ZIP, etc.)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
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
                  {lesson ? 'Guardar Cambios' : 'Crear Clase'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
