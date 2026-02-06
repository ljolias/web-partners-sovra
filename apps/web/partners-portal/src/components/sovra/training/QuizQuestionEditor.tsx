'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  GripVertical,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import type { LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

export type QuestionType = 'multiple_choice' | 'true_false' | 'multi_select';

export interface QuizQuestionData {
  id: string;
  type: QuestionType;
  question: LocalizedString;
  options: LocalizedString[];
  correctAnswers: number[]; // Array of indices for correct answers
  feedbackCorrect?: LocalizedString;
  feedbackIncorrect?: LocalizedString;
}

interface QuizQuestionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuizQuestionData) => void;
  question?: QuizQuestionData; // For editing existing question
}

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// Constants
// ============================================

const QUESTION_TYPE_OPTIONS: Array<{ value: QuestionType; label: string; description: string }> = [
  {
    value: 'multiple_choice',
    label: 'Opcion Multiple',
    description: 'Una sola respuesta correcta',
  },
  {
    value: 'true_false',
    label: 'Verdadero/Falso',
    description: 'Solo dos opciones: Si o No',
  },
  {
    value: 'multi_select',
    label: 'Seleccion Multiple',
    description: 'Varias respuestas correctas',
  },
];

// Default True/False options
const TRUE_FALSE_OPTIONS: LocalizedString[] = [
  { es: 'Verdadero', en: 'True', pt: 'Verdadeiro' },
  { es: 'Falso', en: 'False', pt: 'Falso' },
];

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  return `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyOption(): LocalizedString {
  return { es: '', en: '', pt: '' };
}

function getDefaultQuestion(): QuizQuestionData {
  return {
    id: `question_${Date.now()}`,
    type: 'multiple_choice',
    question: { es: '', en: '', pt: '' },
    options: [
      createEmptyOption(),
      createEmptyOption(),
      createEmptyOption(),
      createEmptyOption(),
    ],
    correctAnswers: [],
    feedbackCorrect: { es: '', en: '', pt: '' },
    feedbackIncorrect: { es: '', en: '', pt: '' },
  };
}

// ============================================
// Option Item Component
// ============================================

interface OptionItemProps {
  index: number;
  option: LocalizedString;
  isCorrect: boolean;
  questionType: QuestionType;
  disabled?: boolean;
  onUpdate: (option: LocalizedString) => void;
  onDelete: () => void;
  onToggleCorrect: () => void;
}

function OptionItem({
  index,
  option,
  isCorrect,
  questionType,
  disabled,
  onUpdate,
  onDelete,
  onToggleCorrect,
}: OptionItemProps) {
  return (
    <div className={`
      flex items-start gap-2 p-3 rounded-lg border transition-colors
      ${isCorrect
        ? 'border-green-500/50 bg-green-500/5'
        : 'border-[var(--color-border)] bg-[var(--color-surface)]'
      }
    `}>
      {/* Correct Answer Toggle */}
      <button
        type="button"
        onClick={onToggleCorrect}
        className={`
          mt-2 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors
          ${isCorrect
            ? 'bg-green-500 text-white'
            : 'border-2 border-[var(--color-border)] hover:border-[var(--color-primary)]'
          }
        `}
        title={isCorrect ? 'Respuesta correcta' : 'Marcar como correcta'}
      >
        {isCorrect ? (
          <Check className="w-4 h-4" />
        ) : (
          questionType === 'multi_select' ? (
            <span className="w-3 h-3" />
          ) : (
            <Circle className="w-3 h-3 text-[var(--color-text-secondary)]" />
          )
        )}
      </button>

      {/* Option Number */}
      <span className="mt-2 w-6 h-6 flex items-center justify-center text-sm font-medium text-[var(--color-text-secondary)] flex-shrink-0">
        {String.fromCharCode(65 + index)}.
      </span>

      {/* Option Input */}
      <div className="flex-1 min-w-0">
        <MultiLangInput
          label=""
          value={option}
          onChange={onUpdate}
          placeholder={{ es: `Opcion ${index + 1}`, en: `Option ${index + 1}`, pt: `Opcao ${index + 1}` }}
        />
      </div>

      {/* Delete Button (only for multiple choice and multi-select) */}
      {!disabled && (
        <button
          type="button"
          onClick={onDelete}
          className="mt-2 p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
          title="Eliminar opcion"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function QuizQuestionEditor({
  isOpen,
  onClose,
  onSave,
  question: initialQuestion,
}: QuizQuestionEditorProps) {
  // State
  const [question, setQuestion] = useState<QuizQuestionData>(
    initialQuestion || getDefaultQuestion()
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  // ============================================
  // Form Handlers
  // ============================================

  const handleTypeChange = useCallback((type: QuestionType) => {
    if (type === 'true_false') {
      // Set fixed true/false options
      setQuestion((prev) => ({
        ...prev,
        type,
        options: TRUE_FALSE_OPTIONS,
        correctAnswers: [],
      }));
    } else {
      // Reset to default options for other types
      setQuestion((prev) => ({
        ...prev,
        type,
        options: prev.type === 'true_false'
          ? [createEmptyOption(), createEmptyOption(), createEmptyOption(), createEmptyOption()]
          : prev.options,
        correctAnswers: type === 'multiple_choice' ? prev.correctAnswers.slice(0, 1) : prev.correctAnswers,
      }));
    }
  }, []);

  const handleQuestionTextChange = (value: LocalizedString) => {
    setQuestion((prev) => ({ ...prev, question: value }));
    if (errors['question.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['question.es'];
        return newErrors;
      });
    }
  };

  const handleOptionUpdate = useCallback((index: number, option: LocalizedString) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? option : o)),
    }));
  }, []);

  const handleOptionDelete = useCallback((index: number) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      // Adjust correct answers indices
      correctAnswers: prev.correctAnswers
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i)),
    }));
  }, []);

  const handleToggleCorrect = useCallback((index: number) => {
    setQuestion((prev) => {
      const isCurrentlyCorrect = prev.correctAnswers.includes(index);

      if (prev.type === 'multiple_choice' || prev.type === 'true_false') {
        // Single correct answer - replace
        return {
          ...prev,
          correctAnswers: isCurrentlyCorrect ? [] : [index],
        };
      } else {
        // Multi-select - toggle
        return {
          ...prev,
          correctAnswers: isCurrentlyCorrect
            ? prev.correctAnswers.filter((i) => i !== index)
            : [...prev.correctAnswers, index].sort((a, b) => a - b),
        };
      }
    });

    // Clear error if any
    if (errors['correctAnswers']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['correctAnswers'];
        return newErrors;
      });
    }
  }, [errors]);

  const handleAddOption = useCallback(() => {
    setQuestion((prev) => ({
      ...prev,
      options: [...prev.options, createEmptyOption()],
    }));
  }, []);

  const handleFeedbackChange = useCallback((field: 'feedbackCorrect' | 'feedbackIncorrect', value: LocalizedString) => {
    setQuestion((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Question text validation
    if (!question.question.es || question.question.es.trim() === '') {
      newErrors['question.es'] = 'La pregunta en espanol es requerida';
    }

    // Options validation (except for true/false)
    if (question.type !== 'true_false') {
      const filledOptions = question.options.filter(
        (o) => o.es && o.es.trim() !== ''
      );
      if (filledOptions.length < 2) {
        newErrors['options'] = 'Se requieren al menos 2 opciones';
      }
    }

    // Correct answer validation
    if (question.correctAnswers.length === 0) {
      newErrors['correctAnswers'] = 'Debes seleccionar al menos una respuesta correcta';
    }

    // Multiple choice: exactly 1 correct
    if (question.type === 'multiple_choice' && question.correctAnswers.length > 1) {
      newErrors['correctAnswers'] = 'Opcion multiple debe tener exactamente 1 respuesta correcta';
    }

    // Multi-select: at least 2 correct
    if (question.type === 'multi_select' && question.correctAnswers.length < 2) {
      newErrors['correctAnswers'] = 'Seleccion multiple debe tener al menos 2 respuestas correctas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Save Handler
  // ============================================

  const handleSave = () => {
    if (!validate()) return;
    onSave(question);
    onClose();
  };

  // ============================================
  // Render
  // ============================================

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {initialQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Configura la pregunta y sus opciones de respuesta
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
            {/* Question Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                Tipo de Pregunta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${question.type === type.value
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }
                    `}
                  >
                    <p className={`text-sm font-medium ${
                      question.type === type.value
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-primary)]'
                    }`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Text */}
            <MultiLangInput
              label="Pregunta"
              value={question.question}
              onChange={handleQuestionTextChange}
              required
              type="textarea"
              placeholder={{
                es: 'Escribe tu pregunta aqui...',
                en: 'Write your question here...',
                pt: 'Escreva sua pergunta aqui...'
              }}
              error={errors['question.es']}
            />

            {/* Answer Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Opciones de Respuesta
                </label>
                {question.type !== 'true_false' && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar opcion
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <OptionItem
                    key={index}
                    index={index}
                    option={option}
                    isCorrect={question.correctAnswers.includes(index)}
                    questionType={question.type}
                    disabled={question.type === 'true_false'}
                    onUpdate={(opt) => handleOptionUpdate(index, opt)}
                    onDelete={() => handleOptionDelete(index)}
                    onToggleCorrect={() => handleToggleCorrect(index)}
                  />
                ))}
              </div>

              {errors['options'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors['options']}
                </p>
              )}

              {errors['correctAnswers'] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors['correctAnswers']}
                </p>
              )}

              <p className="text-xs text-[var(--color-text-secondary)]">
                {question.type === 'multiple_choice' && 'Selecciona la unica respuesta correcta'}
                {question.type === 'true_false' && 'Selecciona si la respuesta es Verdadero o Falso'}
                {question.type === 'multi_select' && 'Selecciona todas las respuestas correctas (minimo 2)'}
              </p>
            </div>

            {/* Feedback (Optional) */}
            <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Retroalimentacion (Opcional)
              </p>

              <MultiLangInput
                label="Mensaje para respuesta correcta"
                value={question.feedbackCorrect || { es: '', en: '', pt: '' }}
                onChange={(v) => handleFeedbackChange('feedbackCorrect', v)}
                type="textarea"
                placeholder={{
                  es: 'Excelente! Has respondido correctamente.',
                  en: 'Excellent! You answered correctly.',
                  pt: 'Excelente! Voce respondeu corretamente.'
                }}
              />

              <MultiLangInput
                label="Mensaje para respuesta incorrecta"
                value={question.feedbackIncorrect || { es: '', en: '', pt: '' }}
                onChange={(v) => handleFeedbackChange('feedbackIncorrect', v)}
                type="textarea"
                placeholder={{
                  es: 'Incorrecto. Revisa el material y vuelve a intentar.',
                  en: 'Incorrect. Review the material and try again.',
                  pt: 'Incorreto. Revise o material e tente novamente.'
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              Guardar Pregunta
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
