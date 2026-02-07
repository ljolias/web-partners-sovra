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
  BookOpen,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  X,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Download,
} from 'lucide-react';
import type { CourseModule } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface ModuleListDisplayProps {
  modules: CourseModule[];
  onChange: (modules: CourseModule[]) => void;
  onAddModule: () => void;
  onEditModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
}

interface SortableModuleItemProps {
  module: CourseModule;
  onEdit: () => void;
  onDelete: () => void;
}

// ============================================
// Helper Functions
// ============================================

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function getLessonTypeIcon(type: string) {
  switch (type) {
    case 'video':
      return <Video className="w-3 h-3" />;
    case 'reading':
      return <FileText className="w-3 h-3" />;
    case 'download':
      return <Download className="w-3 h-3" />;
    default:
      return <BookOpen className="w-3 h-3" />;
  }
}

// ============================================
// Sortable Module Item Component
// ============================================

function SortableModuleItem({ module, onEdit, onDelete }: SortableModuleItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayTitle = module.title.es || module.title.en || Object.values(module.title)[0] || 'Sin título';
  const lessonCount = module.lessons?.length || 0;
  const quizCount = module.quiz?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        rounded-lg
        transition-all duration-200
        ${isDragging ? 'opacity-50 bg-[var(--color-primary)]/10 shadow-lg' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Expand/Collapse */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Order Number */}
        <span className="flex items-center justify-center w-8 h-8 bg-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-full flex-shrink-0">
          {module.order}
        </span>

        {/* Module Icon */}
        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {displayTitle}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {lessonCount} clase{lessonCount !== 1 ? 's' : ''}
            </span>
            {quizCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  {quizCount} pregunta{quizCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
            {module.duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(module.duration)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
            title="Editar módulo"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Eliminar módulo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content - Lessons */}
      {isExpanded && lessonCount > 0 && (
        <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border)]">
          <div className="mt-3 space-y-2">
            {module.lessons.map((lesson, index) => {
              const lessonTitle = lesson.title.es || lesson.title.en || 'Sin título';
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 p-2 bg-[var(--color-surface-hover)] rounded-lg text-xs"
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded-full flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex items-center justify-center w-7 h-7 bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded flex-shrink-0">
                    {getLessonTypeIcon(lesson.type)}
                  </div>
                  <span className="flex-1 text-[var(--color-text-primary)] truncate">
                    {lessonTitle}
                  </span>
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lesson.duration} min
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Delete Confirmation Dialog
// ============================================

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  moduleName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ isOpen, moduleName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
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
          ¿Eliminar módulo?
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
          Estás a punto de eliminar el módulo <span className="font-medium text-[var(--color-text-primary)]">&quot;{moduleName}&quot;</span>.
          Esta acción eliminará todas las clases y quizzes contenidos. No se puede deshacer.
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

export function ModuleListDisplay({
  modules,
  onChange,
  onAddModule,
  onEditModule,
  onDeleteModule,
}: ModuleListDisplayProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    moduleId: string;
    moduleName: string;
  }>({
    isOpen: false,
    moduleId: '',
    moduleName: '',
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
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);

      const reorderedModules = arrayMove(modules, oldIndex, newIndex);

      const updatedModules = reorderedModules.map((module, index) => ({
        ...module,
        order: index + 1,
      }));

      onChange(updatedModules);
    }
  };

  const handleDeleteClick = (module: CourseModule) => {
    const moduleName = module.title.es || module.title.en || Object.values(module.title)[0] || 'Sin título';
    setDeleteDialog({
      isOpen: true,
      moduleId: module.id,
      moduleName,
    });
  };

  const handleDeleteConfirm = () => {
    onDeleteModule(deleteDialog.moduleId);
    setDeleteDialog({ isOpen: false, moduleId: '', moduleName: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, moduleId: '', moduleName: '' });
  };

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Módulos del Curso
        </h3>
        <button
          type="button"
          onClick={onAddModule}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Módulo
        </button>
      </div>

      {/* Module List */}
      {sortedModules.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedModules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedModules.map((module) => (
                <SortableModuleItem
                  key={module.id}
                  module={module}
                  onEdit={() => onEditModule(module.id)}
                  onDelete={() => handleDeleteClick(module)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/50">
          <div className="w-16 h-16 bg-[var(--color-border)] rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[var(--color-text-secondary)]" />
          </div>
          <h4 className="text-base font-medium text-[var(--color-text-primary)] mb-1">
            Sin módulos aún
          </h4>
          <p className="text-sm text-[var(--color-text-secondary)] text-center mb-4">
            Comienza agregando el primer módulo al curso
          </p>
          <button
            type="button"
            onClick={onAddModule}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Primer Módulo
          </button>
        </div>
      )}

      {/* Summary */}
      {sortedModules.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
          <span>{sortedModules.length} módulo{sortedModules.length !== 1 ? 's' : ''}</span>
          <span className="text-[var(--color-border)]">•</span>
          <span>{totalLessons} clase{totalLessons !== 1 ? 's' : ''} totales</span>
          <span className="text-[var(--color-border)]">•</span>
          <span>
            Duración total: {formatDuration(sortedModules.reduce((acc, m) => acc + (m.duration || 0), 0))}
          </span>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        moduleName={deleteDialog.moduleName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
