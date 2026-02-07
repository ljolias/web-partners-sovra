'use client';

import { useState } from 'react';
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
import {
  Video,
  BookOpen,
  Download,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  X,
  Clock,
} from 'lucide-react';
import type { Lesson } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface LessonListEditorProps {
  lessons: Lesson[];
  onChange: (lessons: Lesson[]) => void;
  onAddLesson: () => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}

interface SortableLessonItemProps {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
}

// ============================================
// Helper Functions
// ============================================

function getLessonIcon(type: Lesson['type']) {
  const iconClasses = 'w-5 h-5';

  switch (type) {
    case 'video':
      return <Video className={iconClasses} />;
    case 'reading':
      return <BookOpen className={iconClasses} />;
    case 'download':
      return <Download className={iconClasses} />;
    default:
      return <BookOpen className={iconClasses} />;
  }
}

function getLessonTypeLabel(type: Lesson['type']): string {
  const labels: Record<Lesson['type'], string> = {
    video: 'Video',
    reading: 'Lectura',
    download: 'Descarga',
  };
  return labels[type] || type;
}

function getLessonTypeBgColor(type: Lesson['type']): string {
  const colors: Record<Lesson['type'], string> = {
    video: 'bg-purple-500/10 text-purple-600',
    reading: 'bg-blue-500/10 text-blue-600',
    download: 'bg-green-500/10 text-green-600',
  };
  return colors[type] || 'bg-gray-500/10 text-gray-600';
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// ============================================
// Sortable Lesson Item Component
// ============================================

function SortableLessonItem({ lesson, onEdit, onDelete }: SortableLessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayTitle = lesson.title.es || lesson.title.en || Object.values(lesson.title)[0] || 'Sin título';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3
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
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Order Number */}
      <span className="flex items-center justify-center w-7 h-7 bg-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-medium rounded-full flex-shrink-0">
        {lesson.order}
      </span>

      {/* Lesson Type Icon */}
      <div className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 ${getLessonTypeBgColor(lesson.type)}`}>
        {getLessonIcon(lesson.type)}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {displayTitle}
        </h5>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-border)] px-1.5 py-0.5 rounded">
            {getLessonTypeLabel(lesson.type)}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(lesson.duration)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
          title="Editar clase"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Eliminar clase"
        >
          <Trash2 className="w-3.5 h-3.5" />
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
  lessonName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ isOpen, lessonName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

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
          ¿Eliminar clase?
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
          Estás a punto de eliminar la clase <span className="font-medium text-[var(--color-text-primary)]">&quot;{lessonName}&quot;</span>.
          Esta acción no se puede deshacer.
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

export function LessonListEditor({
  lessons,
  onChange,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: LessonListEditorProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    lessonId: string;
    lessonName: string;
  }>({
    isOpen: false,
    lessonId: '',
    lessonName: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);

      const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);

      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      onChange(updatedLessons);
    }
  };

  const handleDeleteClick = (lesson: Lesson) => {
    const lessonName = lesson.title.es || lesson.title.en || Object.values(lesson.title)[0] || 'Sin título';
    setDeleteDialog({
      isOpen: true,
      lessonId: lesson.id,
      lessonName,
    });
  };

  const handleDeleteConfirm = () => {
    onDeleteLesson(deleteDialog.lessonId);
    setDeleteDialog({ isOpen: false, lessonId: '', lessonName: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, lessonId: '', lessonName: '' });
  };

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Clases del Módulo
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Organiza el contenido de aprendizaje en clases individuales
          </p>
        </div>
        <button
          type="button"
          onClick={onAddLesson}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar Clase
        </button>
      </div>

      {/* Lesson List */}
      {sortedLessons.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedLessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedLessons.map((lesson) => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => onEditLesson(lesson.id)}
                  onDelete={() => handleDeleteClick(lesson)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]/50">
          <div className="w-12 h-12 bg-[var(--color-border)] rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-[var(--color-text-secondary)]" />
          </div>
          <h5 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Sin clases aún
          </h5>
          <p className="text-xs text-[var(--color-text-secondary)] text-center mb-3">
            Agrega la primera clase al módulo
          </p>
          <button
            type="button"
            onClick={onAddLesson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Primera Clase
          </button>
        </div>
      )}

      {/* Summary */}
      {sortedLessons.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
          <span>{sortedLessons.length} clase{sortedLessons.length !== 1 ? 's' : ''}</span>
          <span className="text-[var(--color-border)]">•</span>
          <span>
            Duración total: {formatDuration(sortedLessons.reduce((acc, l) => acc + l.duration, 0))}
          </span>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        lessonName={deleteDialog.lessonName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
