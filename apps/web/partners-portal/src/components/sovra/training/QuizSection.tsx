'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  GripVertical,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import type { CourseQuizQuestion, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface QuizSectionProps {
  questions: CourseQuizQuestion[];
  onChange: (questions: CourseQuizQuestion[]) => void;
  passingScore: number;
  onPassingScoreChange: (score: number) => void;
}

// ============================================
// Question Editor Component
// ============================================

interface QuestionEditorProps {
  question: CourseQuizQuestion;
  index: number;
  onUpdate: (question: CourseQuizQuestion) => void;
  onDelete: () => void;
}

function QuestionEditor({ question, index, onUpdate, onDelete }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuestionChange = (value: LocalizedString) => {
    onUpdate({ ...question, question: value });
  };

  const handleOptionChange = (optionIndex: number, value: LocalizedString) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (index: number) => {
    onUpdate({ ...question, correctAnswer: index });
  };

  const handleAddOption = () => {
    if (question.options.length < 6) {
      onUpdate({
        ...question,
        options: [...question.options, { es: '', en: '', pt: '' }],
      });
    }
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      const newCorrectAnswer =
        question.correctAnswer === optionIndex
          ? 0
          : question.correctAnswer > optionIndex
          ? question.correctAnswer - 1
          : question.correctAnswer;

      onUpdate({
        ...question,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    }
  };

  const questionText = question.question.es || question.question.en || 'Nueva pregunta';

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <GripVertical className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0" />
        <span className="flex items-center justify-center w-7 h-7 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {questionText}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {question.options.length} opciones • Respuesta correcta: {question.correctAnswer + 1}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Eliminar pregunta"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-[var(--color-border)]">
          {/* Question Text */}
          <div>
            <MultiLangInput
              label={`Pregunta ${index + 1}`}
              value={question.question}
              onChange={handleQuestionChange}
              required
              placeholder={{
                es: '¿Cuál es la característica principal de...?',
                en: 'What is the main feature of...?',
                pt: 'Qual é a característica principal de...?',
              }}
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Opciones de Respuesta
            </label>
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-start gap-2">
                  {/* Radio button for correct answer */}
                  <button
                    type="button"
                    onClick={() => handleCorrectAnswerChange(optionIndex)}
                    className={`
                      mt-8 flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors
                      ${
                        question.correctAnswer === optionIndex
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-[var(--color-border)] hover:border-green-500'
                      }
                    `}
                    title="Marcar como respuesta correcta"
                  >
                    {question.correctAnswer === optionIndex && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>

                  {/* Option input */}
                  <div className="flex-1">
                    <MultiLangInput
                      label={`Opción ${optionIndex + 1}`}
                      value={option}
                      onChange={(value) => handleOptionChange(optionIndex, value)}
                      required
                      placeholder={{
                        es: 'Escribe la opción de respuesta...',
                        en: 'Write the answer option...',
                        pt: 'Escreva a opção de resposta...',
                      }}
                    />
                  </div>

                  {/* Remove option button */}
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optionIndex)}
                      className="mt-8 p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar opción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add option button */}
            {question.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                Agregar opción (máx. 6)
              </button>
            )}
          </div>

          {/* Correct answer indicator */}
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-green-700">
              <span className="font-medium">Respuesta correcta:</span> Opción {question.correctAnswer + 1}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function QuizSection({
  questions,
  onChange,
  passingScore,
  onPassingScoreChange,
}: QuizSectionProps) {
  const handleAddQuestion = () => {
    const newQuestion: CourseQuizQuestion = {
      id: `question_${Date.now()}`,
      question: { es: '', en: '', pt: '' },
      options: [
        { es: '', en: '', pt: '' },
        { es: '', en: '', pt: '' },
      ],
      correctAnswer: 0,
    };
    onChange([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, question: CourseQuizQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    onChange(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    onPassingScoreChange(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Quiz del Módulo
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Crea preguntas de opción múltiple para evaluar el aprendizaje al final del módulo
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar Pregunta
        </button>
      </div>

      {/* Passing Score */}
      <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg p-4">
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Puntuación Mínima para Aprobar (%)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={passingScore}
            onChange={handlePassingScoreChange}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={handlePassingScoreChange}
              className="w-20 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] text-center focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">%</span>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
          Los usuarios deben obtener al menos {passingScore}% para aprobar este módulo
        </p>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onUpdate={(q) => handleUpdateQuestion(index, q)}
              onDelete={() => handleDeleteQuestion(index)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/50">
          <div className="w-16 h-16 bg-[var(--color-border)] rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-[var(--color-text-secondary)]" />
          </div>
          <h4 className="text-base font-medium text-[var(--color-text-primary)] mb-1">
            Sin preguntas aún
          </h4>
          <p className="text-sm text-[var(--color-text-secondary)] text-center mb-4 max-w-md">
            Agrega preguntas de opción múltiple para crear un quiz al final del módulo
          </p>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Primera Pregunta
          </button>
        </div>
      )}

      {/* Summary */}
      {questions.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] pt-4 border-t border-[var(--color-border)]">
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            {questions.length} pregunta{questions.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[var(--color-border)]">•</span>
          <span>Puntuación mínima: {passingScore}%</span>
        </div>
      )}

      {/* Info banner */}
      {questions.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Sobre los quizzes</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Los usuarios deben completar el quiz para terminar el módulo</li>
              <li>Pueden reintentar el quiz si no alcanzan la puntuación mínima</li>
              <li>Las respuestas se muestran aleatorizadas para cada intento</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
