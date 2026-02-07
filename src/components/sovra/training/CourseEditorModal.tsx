'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  AlertCircle,
  BookOpen,
  Award,
  Settings,
  Loader2,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import { ModuleEditorModal } from './ModuleEditorModal';
import { ModuleListDisplay } from './ModuleListDisplay';
import type {
  TrainingCourse,
  CourseModule,
  LocalizedString,
  CourseCategory,
  CourseLevel,
} from '@/types';

// ============================================
// Type Definitions
// ============================================

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId?: string; // Optional - for editing existing course
}

type TabType = 'details' | 'modules';

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// Constants
// ============================================

const CATEGORY_OPTIONS: Array<{ value: CourseCategory; label: string }> = [
  { value: 'sales', label: 'Ventas' },
  { value: 'technical', label: 'Técnico' },
  { value: 'legal', label: 'Legal' },
  { value: 'product', label: 'Producto' },
];

const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'details', label: 'Detalles', icon: <Settings className="w-4 h-4" /> },
  { id: 'modules', label: 'Módulos', icon: <BookOpen className="w-4 h-4" /> },
];

// ============================================
// Initial State
// ============================================

const getInitialCourseState = (): Partial<TrainingCourse> => ({
  title: { es: '', en: '', pt: '' },
  description: { es: '', en: '', pt: '' },
  category: 'sales',
  level: 'basic',
  duration: 60,
  modules: [],
  isPublished: false,
  isRequired: false,
  passingScore: 70,
  certificateEnabled: false,
  order: 1,
});

// ============================================
// Main Component
// ============================================

export function CourseEditorModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
}: CourseEditorModalProps) {
  // State
  const [course, setCourse] = useState<Partial<TrainingCourse>>(getInitialCourseState());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [apiError, setApiError] = useState<string | null>(null);

  // Module editor modal state
  const [isModuleEditorOpen, setIsModuleEditorOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | undefined>(undefined);

  // ============================================
  // Data Fetching
  // ============================================

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`/api/sovra/training/courses/${courseId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar el curso');
      }

      const data = await response.json();
      setCourse(data.course);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourse();
    } else if (isOpen && !courseId) {
      setCourse(getInitialCourseState());
      setErrors({});
      setApiError(null);
      setActiveTab('details');
    }
  }, [isOpen, courseId, fetchCourse]);

  // ============================================
  // Form Handlers
  // ============================================

  const handleTitleChange = (value: LocalizedString) => {
    setCourse((prev) => ({ ...prev, title: value }));
    if (errors['title.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['title.es'];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (value: LocalizedString) => {
    setCourse((prev) => ({ ...prev, description: value }));
    if (errors['description.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['description.es'];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse((prev) => ({ ...prev, category: e.target.value as CourseCategory }));
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse((prev) => ({ ...prev, level: e.target.value as CourseLevel }));
  };

  const handleIsPublishedChange = () => {
    setCourse((prev) => ({ ...prev, isPublished: !prev.isPublished }));
  };

  const handleIsRequiredChange = () => {
    setCourse((prev) => ({ ...prev, isRequired: !prev.isRequired }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
    setCourse((prev) => ({ ...prev, duration: value }));
  };

  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    setCourse((prev) => ({ ...prev, passingScore: value }));
  };

  const handleCertificateToggle = () => {
    setCourse((prev) => ({ ...prev, certificateEnabled: !prev.certificateEnabled }));
  };

  // ============================================
  // Module Handlers
  // ============================================

  const handleModulesChange = (modules: CourseModule[]) => {
    setCourse((prev) => ({ ...prev, modules }));
  };

  const handleAddModule = () => {
    setEditingModule(undefined);
    setIsModuleEditorOpen(true);
  };

  const handleEditModule = (moduleId: string) => {
    const module = course.modules?.find((m) => m.id === moduleId);
    if (module) {
      setEditingModule(module);
      setIsModuleEditorOpen(true);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: (prev.modules || [])
        .filter((m) => m.id !== moduleId)
        .map((m, index) => ({ ...m, order: index + 1 })),
    }));
  };

  const handleSaveModule = (module: CourseModule) => {
    if (editingModule) {
      // Update existing module
      const updatedModules = (course.modules || []).map((m) =>
        m.id === module.id ? module : m
      );
      handleModulesChange(updatedModules);
    } else {
      // Add new module
      const newModule = {
        ...module,
        order: (course.modules?.length || 0) + 1,
      };
      handleModulesChange([...(course.modules || []), newModule]);
    }
    setIsModuleEditorOpen(false);
    setEditingModule(undefined);
  };

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!course.title?.es || course.title.es.trim() === '') {
      newErrors['title.es'] = 'El título en español es requerido';
    }

    // Description validation
    if (!course.description?.es || course.description.es.trim() === '') {
      newErrors['description.es'] = 'La descripción en español es requerida';
    }

    // Duration validation
    if (!course.duration || course.duration < 1) {
      newErrors['duration'] = 'La duración debe ser mayor a 0';
    }

    // Modules validation
    if (!course.modules || course.modules.length === 0) {
      newErrors['modules'] = 'Debes agregar al menos un módulo al curso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Form Submission
  // ============================================

  const handleSave = async () => {
    if (!validate()) {
      // Switch to the tab with errors
      if (errors['title.es'] || errors['description.es'] || errors['duration']) {
        setActiveTab('details');
      } else if (errors['modules']) {
        setActiveTab('modules');
      }
      return;
    }

    setSaving(true);
    setApiError(null);

    try {
      const url = courseId
        ? `/api/sovra/training/courses/${courseId}`
        : '/api/sovra/training/courses';

      const method = courseId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el curso');
      }

      // Success
      onSuccess();
      handleClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Reset & Close
  // ============================================

  const handleClose = () => {
    setCourse(getInitialCourseState());
    setErrors({});
    setApiError(null);
    setActiveTab('details');
    onClose();
  };

  // ============================================
  // Render
  // ============================================

  const inputClasses = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors';
  const labelClasses = 'block text-sm font-medium text-[var(--color-text-primary)] mb-1';

  return (
    <>
    {isOpen && (
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
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {courseId ? 'Editar Curso' : 'Nuevo Curso'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {courseId ? 'Modifica los detalles del curso' : 'Crea un nuevo curso de capacitacion'}
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
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                    />
                  )}
                </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                <p className="text-[var(--color-text-secondary)] mt-4">Cargando curso...</p>
              </div>
            ) : (
              <>
                {/* API Error */}
                {apiError && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-500">Error</p>
                      <p className="text-sm text-red-500/80">{apiError}</p>
                    </div>
                  </div>
                )}

                {/* Tab: Details */}
                {activeTab === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* Title */}
                    <MultiLangInput
                      label="Titulo del Curso"
                      value={course.title || { es: '', en: '', pt: '' }}
                      onChange={handleTitleChange}
                      required
                      placeholder={{ es: 'Fundamentos de Ventas', en: 'Sales Fundamentals', pt: 'Fundamentos de Vendas' }}
                      error={errors['title.es']}
                    />

                    {/* Description */}
                    <MultiLangInput
                      label="Descripcion"
                      value={course.description || { es: '', en: '', pt: '' }}
                      onChange={handleDescriptionChange}
                      required
                      type="textarea"
                      placeholder={{ es: 'Descripcion del curso...', en: 'Course description...', pt: 'Descricao do curso...' }}
                      error={errors['description.es']}
                    />

                    {/* Category & Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Categoría</label>
                        <select
                          value={course.category || 'sales'}
                          onChange={handleCategoryChange}
                          className={inputClasses}
                        >
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClasses}>Nivel</label>
                        <select
                          value={course.level || 'basic'}
                          onChange={handleLevelChange}
                          className={inputClasses}
                        >
                          {LEVEL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Duration & Passing Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>
                          Duración (minutos) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={course.duration || 60}
                          onChange={handleDurationChange}
                          className={inputClasses}
                        />
                        {errors['duration'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['duration']}</p>
                        )}
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          Se calculará automáticamente desde los módulos
                        </p>
                      </div>

                      <div>
                        <label className={labelClasses}>Puntaje para Aprobar (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={course.passingScore || 70}
                          onChange={handlePassingScoreChange}
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      {/* Is Published Toggle */}
                      <div className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Publicado
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            Hacer visible para los partners
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={course.isPublished || false}
                            onChange={handleIsPublishedChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
                        </label>
                      </div>

                      {/* Is Required Toggle */}
                      <div className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Curso Obligatorio
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            Los partners deben completarlo
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={course.isRequired || false}
                            onChange={handleIsRequiredChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
                        </label>
                      </div>

                      {/* Certificate Enabled Toggle */}
                      <div className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Emitir Certificado
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            Generar certificado al completar el curso
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={course.certificateEnabled || false}
                            onChange={handleCertificateToggle}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Modules */}
                {activeTab === 'modules' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <ModuleListDisplay
                      modules={course.modules || []}
                      onChange={handleModulesChange}
                      onAddModule={handleAddModule}
                      onEditModule={handleEditModule}
                      onDeleteModule={handleDeleteModule}
                    />
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="text-xs text-[var(--color-text-secondary)]">
              {course.modules?.length || 0} modulo{(course.modules?.length || 0) !== 1 ? 's' : ''} configurado{(course.modules?.length || 0) !== 1 ? 's' : ''}
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
                disabled={saving || loading}
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
                    {courseId ? 'Guardar Cambios' : 'Crear Curso'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    )}

    {/* Module Editor Modal */}
    <ModuleEditorModal
      isOpen={isModuleEditorOpen}
      onClose={() => {
        setIsModuleEditorOpen(false);
        setEditingModule(undefined);
      }}
      onSave={handleSaveModule}
      module={editingModule}
      order={editingModule?.order || (course.modules?.length || 0) + 1}
    />
    </>
  );
}
