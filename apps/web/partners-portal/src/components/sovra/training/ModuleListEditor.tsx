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
  Play,
  BookOpen,
  HelpCircle,
  Download,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  X,
} from 'lucide-react';
import { EnhancedCourseModule, ModuleType } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface ModuleListEditorProps {
  /** List of modules to display and edit */
  modules: EnhancedCourseModule[];
  /** Callback when modules array changes (reorder, delete) */
  onChange: (modules: EnhancedCourseModule[]) => void;
  /** Callback to add a new module */
  onAddModule: () => void;
  /** Callback to edit an existing module */
  onEditModule: (moduleId: string) => void;
  /** Callback to delete a module */
  onDeleteModule: (moduleId: string) => void;
}

interface SortableModuleItemProps {
  module: EnhancedCourseModule;
  onEdit: () => void;
  onDelete: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Returns the appropriate icon component for a module type
 */
function getModuleIcon(type: ModuleType) {
  const iconClasses = 'w-5 h-5';

  switch (type) {
    case 'video':
      return <Play className={iconClasses} />;
    case 'reading':
      return <BookOpen className={iconClasses} />;
    case 'quiz':
      return <HelpCircle className={iconClasses} />;
    case 'download':
      return <Download className={iconClasses} />;
    default:
      return <BookOpen className={iconClasses} />;
  }
}

/**
 * Returns a human-readable label for a module type (in Spanish)
 */
function getModuleTypeLabel(type: ModuleType): string {
  const labels: Record<ModuleType, string> = {
    video: 'Video',
    reading: 'Lectura',
    quiz: 'Quiz',
    download: 'Descarga',
  };
  return labels[type] || type;
}

/**
 * Formats duration in minutes to a readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// ============================================
// Sortable Module Item Component
// ============================================

function SortableModuleItem({ module, onEdit, onDelete }: SortableModuleItemProps) {
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

  // Get the display title (prefer Spanish, fallback to English or first available)
  const displayTitle = module.title.es || module.title.en || Object.values(module.title)[0] || 'Sin título';

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

      {/* Order Number Badge */}
      <span className="flex items-center justify-center w-8 h-8 bg-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-full flex-shrink-0">
        {module.order}
      </span>

      {/* Module Type Icon */}
      <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg flex-shrink-0">
        {getModuleIcon(module.type)}
      </div>

      {/* Module Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {displayTitle}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-border)] px-2 py-0.5 rounded">
            {getModuleTypeLabel(module.type)}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {formatDuration(module.duration)}
          </span>
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
  );
}

// ============================================
// Delete Confirmation Dialog Component
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 text-red-500 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] text-center mb-2">
          ¿Eliminar módulo?
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
          Estás a punto de eliminar el módulo <span className="font-medium text-[var(--color-text-primary)]">&quot;{moduleName}&quot;</span>.
          Esta acción no se puede deshacer.
        </p>

        {/* Actions */}
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
// Main ModuleListEditor Component
// ============================================

export function ModuleListEditor({
  modules,
  onChange,
  onAddModule,
  onEditModule,
  onDeleteModule,
}: ModuleListEditorProps) {
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    moduleId: string;
    moduleName: string;
  }>({
    isOpen: false,
    moduleId: '',
    moduleName: '',
  });

  // Configure DnD sensors for keyboard and pointer interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small drag distance before starting
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handles the end of a drag operation
   * Reorders modules and updates the order property
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);

      // Reorder the array
      const reorderedModules = arrayMove(modules, oldIndex, newIndex);

      // Update the order property for each module
      const updatedModules = reorderedModules.map((module: EnhancedCourseModule, index: number) => ({
        ...module,
        order: index + 1,
      }));

      onChange(updatedModules);
    }
  };

  /**
   * Opens the delete confirmation dialog
   */
  const handleDeleteClick = (module: EnhancedCourseModule) => {
    const moduleName = module.title.es || module.title.en || Object.values(module.title)[0] || 'Sin título';
    setDeleteDialog({
      isOpen: true,
      moduleId: module.id,
      moduleName,
    });
  };

  /**
   * Confirms the delete action
   */
  const handleDeleteConfirm = () => {
    onDeleteModule(deleteDialog.moduleId);
    setDeleteDialog({ isOpen: false, moduleId: '', moduleName: '' });
  };

  /**
   * Cancels the delete action
   */
  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, moduleId: '', moduleName: '' });
  };

  // Sort modules by order before rendering
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
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

      {/* Module List with Drag and Drop */}
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
        /* Empty State */
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

      {/* Module Count Summary */}
      {sortedModules.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
          <span>{sortedModules.length} módulo{sortedModules.length !== 1 ? 's' : ''}</span>
          <span className="text-[var(--color-border)]">•</span>
          <span>
            Duración total: {formatDuration(sortedModules.reduce((acc, m) => acc + m.duration, 0))}
          </span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        moduleName={deleteDialog.moduleName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
