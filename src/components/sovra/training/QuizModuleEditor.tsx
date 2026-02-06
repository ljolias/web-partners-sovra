'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  AlertCircle,
  Check,
  X,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MultiLangInput } from './MultiLangInput';
import { QuizQuestionEditor, QuizQuestionData, QuestionType } from './QuizQuestionEditor';
import type { EnhancedCourseModule, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface QuizModuleEditorProps {
  module: EnhancedCourseModule;
  onChange: (module: EnhancedCourseModule) => void;
  onSave: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

// Extended module type for quiz modules
interface QuizModule extends EnhancedCourseModule {
  questions?: QuizQuestionData[];
  passingScore?: number;
  maxAttempts?: number;
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  showCorrectAnswers?: boolean;
}

// ============================================
// Constants
// ============================================

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Opcion Multiple',
  true_false: 'Verdadero/Falso',
  multi_select: 'Seleccion Multiple',
};

// ============================================
// Sortable Question Item Component
// ============================================

interface SortableQuestionItemProps {
  question: QuizQuestionData;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableQuestionItem({ question, index, onEdit, onDelete }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayQuestion = question.question.es || question.question.en || 'Pregunta sin titulo';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-4
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        rounded-lg
        transition-all duration-200
        ${isDragging ? 'opacity-50 bg-[var(--color-primary)]/10 shadow-lg' : 'hover:border-[var(--color-primary)]/50'}
      `}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Question Number */}
      <span className="flex items-center justify-center w-8 h-8 bg-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-full flex-shrink-0">
        {index + 1}
      </span>

      {/* Question Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {displayQuestion}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-border)] px-2 py-0.5 rounded">
            {QUESTION_TYPE_LABELS[question.type]}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {question.options.length} opciones
          </span>
          <span className="text-xs text-green-600">
            {question.correctAnswers.length} correcta{question.correctAnswers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
          title="Editar pregunta"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Eliminar pregunta"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Delete Confirmation Dialog
// ============================================

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  questionText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ isOpen, questionText, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 text-red-500 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] text-center mb-2">
          Eliminar pregunta?
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
          Estas a punto de eliminar: <span className="font-medium text-[var(--color-text-primary)]">&quot;{questionText}&quot;</span>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function QuizModuleEditor({
  module,
  onChange,
  onSave,
}: QuizModuleEditorProps) {
  // Cast module to extended type
  const quizModule = module as QuizModule;

  // State
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [questionEditorOpen, setQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionData | undefined>(undefined);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    questionId: string;
    questionText: string;
  }>({
    isOpen: false,
    questionId: '',
    questionText: '',
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ============================================
  // Form Handlers
  // ============================================

  const handleTitleChange = (value: LocalizedString) => {
    onChange({ ...module, title: value });
    if (errors['title.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['title.es'];
        return newErrors;
      });
    }
  };

  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    onChange({
      ...module,
      ...({ passingScore: value } as Partial<QuizModule>),
    } as EnhancedCourseModule);
  };

  const handleMaxAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    onChange({
      ...module,
      ...({ maxAttempts: value } as Partial<QuizModule>),
    } as EnhancedCourseModule);
  };

  const handleToggleChange = (field: 'randomizeQuestions' | 'randomizeAnswers' | 'showCorrectAnswers') => {
    onChange({
      ...module,
      ...({ [field]: !(quizModule[field] ?? false) } as Partial<QuizModule>),
    } as EnhancedCourseModule);
  };

  // ============================================
  // Question Handlers
  // ============================================

  const handleAddQuestion = () => {
    setEditingQuestion(undefined);
    setQuestionEditorOpen(true);
  };

  const handleEditQuestion = (question: QuizQuestionData) => {
    setEditingQuestion(question);
    setQuestionEditorOpen(true);
  };

  const handleDeleteQuestion = (question: QuizQuestionData) => {
    const questionText = question.question.es || question.question.en || 'Pregunta sin titulo';
    setDeleteDialog({
      isOpen: true,
      questionId: question.id,
      questionText: questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText,
    });
  };

  const handleConfirmDelete = () => {
    const questions = quizModule.questions || [];
    const filteredQuestions = questions.filter((q) => q.id !== deleteDialog.questionId);
    onChange({
      ...module,
      ...({ questions: filteredQuestions } as Partial<QuizModule>),
    } as EnhancedCourseModule);
    setDeleteDialog({ isOpen: false, questionId: '', questionText: '' });
  };

  const handleSaveQuestion = (question: QuizQuestionData) => {
    const questions = quizModule.questions || [];

    if (editingQuestion) {
      // Update existing question
      const updatedQuestions = questions.map((q) =>
        q.id === question.id ? question : q
      );
      onChange({
        ...module,
        ...({ questions: updatedQuestions } as Partial<QuizModule>),
      } as EnhancedCourseModule);
    } else {
      // Add new question
      onChange({
        ...module,
        ...({ questions: [...questions, question] } as Partial<QuizModule>),
      } as EnhancedCourseModule);
    }

    // Clear errors
    if (errors['questions']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['questions'];
        return newErrors;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const questions = quizModule.questions || [];

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      onChange({
        ...module,
        ...({ questions: reorderedQuestions } as Partial<QuizModule>),
      } as EnhancedCourseModule);
    }
  };

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!module.title?.es || module.title.es.trim() === '') {
      newErrors['title.es'] = 'El titulo en espanol es requerido';
    }

    // Questions validation
    const questions = quizModule.questions || [];
    if (questions.length === 0) {
      newErrors['questions'] = 'Se requiere al menos 1 pregunta';
    }

    // Validate each question has at least 1 correct answer
    for (const question of questions) {
      if (question.correctAnswers.length === 0) {
        newErrors['questions'] = 'Todas las preguntas deben tener al menos 1 respuesta correcta';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Save Handler
  // ============================================

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      onSave();
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  const inputClasses = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors';
  const labelClasses = 'block text-sm font-medium text-[var(--color-text-primary)] mb-1';

  const questions = quizModule.questions || [];
  const passingScore = quizModule.passingScore ?? 70;
  const maxAttempts = quizModule.maxAttempts ?? 0;
  const randomizeQuestions = quizModule.randomizeQuestions ?? false;
  const randomizeAnswers = quizModule.randomizeAnswers ?? false;
  const showCorrectAnswers = quizModule.showCorrectAnswers ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Modulo de Quiz
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Crea preguntas para evaluar el conocimiento
          </p>
        </div>
      </div>

      {/* Module Title */}
      <MultiLangInput
        label="Titulo del Modulo"
        value={module.title || { es: '', en: '', pt: '' }}
        onChange={handleTitleChange}
        required
        placeholder={{ es: 'Quiz de evaluacion', en: 'Evaluation quiz', pt: 'Quiz de avaliacao' }}
        error={errors['title.es']}
      />

      {/* Quiz Settings */}
      <div className="p-4 bg-[var(--color-surface-hover)] rounded-lg space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Configuracion del Quiz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Puntaje para Aprobar (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={handlePassingScoreChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Intentos Maximos
              <span className="font-normal text-[var(--color-text-secondary)] ml-1">(0 = ilimitados)</span>
            </label>
            <input
              type="number"
              min={0}
              value={maxAttempts}
              onChange={handleMaxAttemptsChange}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-primary)]">Aleatorizar Preguntas</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={() => handleToggleChange('randomizeQuestions')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-primary)]">Aleatorizar Respuestas</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeAnswers}
                onChange={() => handleToggleChange('randomizeAnswers')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]" />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-primary)]">Mostrar Correctas</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCorrectAnswers}
                onChange={() => handleToggleChange('showCorrectAnswers')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]" />
            </label>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClasses}>
            Preguntas <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Pregunta
          </button>
        </div>

        {questions.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={() => handleEditQuestion(question)}
                    onDelete={() => handleDeleteQuestion(question)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-6 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/50">
            <HelpCircle className="w-12 h-12 text-[var(--color-text-secondary)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Sin preguntas aun
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Agrega preguntas para crear el quiz
            </p>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Agregar Primera Pregunta
            </button>
          </div>
        )}

        {errors['questions'] && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors['questions']}
          </p>
        )}

        {questions.length > 0 && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {questions.length} pregunta{questions.length !== 1 ? 's' : ''} - Arrastra para reordenar
          </p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Modulo
            </>
          )}
        </button>
      </div>

      {/* Question Editor Modal */}
      <QuizQuestionEditor
        isOpen={questionEditorOpen}
        onClose={() => setQuestionEditorOpen(false)}
        onSave={handleSaveQuestion}
        question={editingQuestion}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        questionText={deleteDialog.questionText}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, questionId: '', questionText: '' })}
      />
    </motion.div>
  );
}
