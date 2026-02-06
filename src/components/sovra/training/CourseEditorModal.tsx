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
import { ModuleListEditor } from './ModuleListEditor';
import { ModuleTypeSelectorModal } from './ModuleTypeSelectorModal';
import { ModuleEditorModal } from './ModuleEditorModal';
import type {
  EnhancedTrainingCourse,
  EnhancedCourseModule,
  LocalizedString,
  EnhancedCourseCategory,
  CourseDifficulty,
  CourseStatus,
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

type TabType = 'details' | 'modules' | 'certification';

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// Constants
// ============================================

const CATEGORY_OPTIONS: Array<{ value: EnhancedCourseCategory; label: string }> = [
  { value: 'sales' as EnhancedCourseCategory, label: 'Ventas' },
  { value: 'technical' as EnhancedCourseCategory, label: 'Tecnico' },
  { value: 'legal' as EnhancedCourseCategory, label: 'Legal' },
  { value: 'product' as EnhancedCourseCategory, label: 'Producto' },
];

const LEVEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'basic', label: 'Basico' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const STATUS_OPTIONS: Array<{ value: CourseStatus; label: string }> = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
];

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'details', label: 'Detalles', icon: <Settings className="w-4 h-4" /> },
  { id: 'modules', label: 'Modulos', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'certification', label: 'Certificacion', icon: <Award className="w-4 h-4" /> },
];

// ============================================
// Initial State
// ============================================

const getInitialCourseState = (): Partial<EnhancedTrainingCourse> => ({
  title: { es: '', en: '', pt: '' },
  description: { es: '', en: '', pt: '' },
  category: 'sales' as EnhancedCourseCategory,
  level: 'basic' as CourseDifficulty,
  estimatedHours: 1,
  modules: [],
  hasCertification: false,
  status: 'draft',
  passingScore: 70,
  certification: {
    credentialName: '',
    credentialDescription: '',
    issuerName: '',
    issuerEmail: '',
  },
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
  const [course, setCourse] = useState<Partial<EnhancedTrainingCourse>>(getInitialCourseState());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [apiError, setApiError] = useState<string | null>(null);
  const [showModuleTypeSelector, setShowModuleTypeSelector] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

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
    setCourse((prev) => ({ ...prev, category: e.target.value as EnhancedCourseCategory }));
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse((prev) => ({ ...prev, level: e.target.value as CourseDifficulty }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourse((prev) => ({ ...prev, status: e.target.value as CourseStatus }));
  };

  const handleEstimatedHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
    setCourse((prev) => ({ ...prev, estimatedHours: value }));
  };

  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    setCourse((prev) => ({ ...prev, passingScore: value }));
  };

  const handleCertificationToggle = () => {
    setCourse((prev) => ({ ...prev, hasCertification: !prev.hasCertification }));
  };

  const handleCertificationFieldChange = (field: string, value: string) => {
    setCourse((prev) => ({
      ...prev,
      certification: {
        ...prev.certification,
        [field]: value,
      },
    }));
    if (errors[`certification.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`certification.${field}`];
        return newErrors;
      });
    }
  };

  // ============================================
  // Module Handlers
  // ============================================

  const handleModulesChange = (modules: EnhancedCourseModule[]) => {
    setCourse((prev) => ({ ...prev, modules }));
  };

  const handleAddModule = () => {
    setShowModuleTypeSelector(true);
  };

  const handleModuleTypeSelected = (type: EnhancedCourseModule['type']) => {
    const newModule: EnhancedCourseModule = {
      id: `module_${Date.now()}`,
      title: { es: 'Nuevo Modulo', en: '', pt: '' },
      type,
      duration: 15,
      order: (course.modules?.length || 0) + 1,
    };
    setCourse((prev) => ({
      ...prev,
      modules: [...(prev.modules || []), newModule],
    }));
    setEditingModuleId(newModule.id);
  };

  const handleEditModule = (moduleId: string) => {
    setEditingModuleId(moduleId);
  };

  const handleModuleSave = (updatedModule: EnhancedCourseModule) => {
    setCourse((prev) => ({
      ...prev,
      modules: (prev.modules || []).map((m) =>
        m.id === updatedModule.id ? updatedModule : m
      ),
    }));
    setEditingModuleId(null);
  };

  const handleDeleteModule = (moduleId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: (prev.modules || [])
        .filter((m) => m.id !== moduleId)
        .map((m, index) => ({ ...m, order: index + 1 })),
    }));
  };

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!course.title?.es || course.title.es.trim() === '') {
      newErrors['title.es'] = 'El titulo en espanol es requerido';
    }

    // Description validation
    if (!course.description?.es || course.description.es.trim() === '') {
      newErrors['description.es'] = 'La descripcion en espanol es requerida';
    }

    // Estimated hours validation
    if (!course.estimatedHours || course.estimatedHours < 1) {
      newErrors['estimatedHours'] = 'Las horas estimadas deben ser mayor a 0';
    }

    // Certification validation
    if (course.hasCertification) {
      if (!course.certification?.credentialName || course.certification.credentialName.trim() === '') {
        newErrors['certification.credentialName'] = 'El nombre de la credencial es requerido';
      }
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
      if (errors['title.es'] || errors['description.es'] || errors['estimatedHours']) {
        setActiveTab('details');
      } else if (errors['certification.credentialName']) {
        setActiveTab('certification');
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)] bg-[var(--color-bg)]">
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
                    <div>
                      <label className={labelClasses}>
                        Titulo del Curso <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={course.title?.es || ''}
                        onChange={(e) => handleTitleChange({ ...course.title, es: e.target.value })}
                        placeholder="Fundamentos de Ventas"
                        className={inputClasses}
                      />
                      {errors['title.es'] && (
                        <p className="text-sm text-red-500 mt-1">{errors['title.es']}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className={labelClasses}>
                        Descripcion <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={course.description?.es || ''}
                        onChange={(e) => handleDescriptionChange({ ...course.description, es: e.target.value })}
                        placeholder="Descripcion del curso..."
                        className={inputClasses + ' resize-none'}
                      />
                      {errors['description.es'] && (
                        <p className="text-sm text-red-500 mt-1">{errors['description.es']}</p>
                      )}
                    </div>

                    {/* Category & Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Categoria</label>
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
                        <label className={labelClasses}>Dificultad</label>
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

                    {/* Estimated Hours & Passing Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>
                          Horas Estimadas <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={course.estimatedHours || 1}
                          onChange={handleEstimatedHoursChange}
                          className={inputClasses}
                        />
                        {errors['estimatedHours'] && (
                          <p className="text-sm text-red-500 mt-1">{errors['estimatedHours']}</p>
                        )}
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

                    {/* Status */}
                    <div>
                      <label className={labelClasses}>Estado</label>
                      <select
                        value={course.status || 'draft'}
                        onChange={handleStatusChange}
                        className={inputClasses}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
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
                    <ModuleListEditor
                      modules={course.modules || []}
                      onChange={handleModulesChange}
                      onAddModule={handleAddModule}
                      onEditModule={handleEditModule}
                      onDeleteModule={handleDeleteModule}
                    />
                  </motion.div>
                )}

                {/* Tab: Certification */}
                {activeTab === 'certification' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* Enable/Disable Certification Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-[var(--color-primary)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            Habilitar Certificacion
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            Permite emitir credenciales verificables al completar
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={course.hasCertification || false}
                          onChange={handleCertificationToggle}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                      </label>
                    </div>

                    {/* Certificate Fields - Only show if enabled */}
                    {course.hasCertification && (
                      <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              Configuracion de Certificacion
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                              Personaliza los detalles de la credencial que recibiran los estudiantes
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Credential Fields - Only show if enabled */}
                    {course.hasCertification && (
                      <>
                        {/* Credential Name */}
                        <div>
                          <label className={labelClasses}>
                            Nombre de la Credencial <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={course.certification?.credentialName || ''}
                            onChange={(e) => handleCertificationFieldChange('credentialName', e.target.value)}
                            placeholder="Ej: Certificacion en Ventas B2B"
                            className={inputClasses}
                          />
                          {errors['certification.credentialName'] && (
                            <p className="text-sm text-red-500 mt-1">{errors['certification.credentialName']}</p>
                          )}
                        </div>

                        {/* Credential Description */}
                        <div>
                          <label className={labelClasses}>Descripcion de la Credencial</label>
                          <textarea
                            rows={3}
                            value={course.certification?.credentialDescription || ''}
                            onChange={(e) => handleCertificationFieldChange('credentialDescription', e.target.value)}
                            placeholder="Describe las competencias que certifica esta credencial..."
                            className={inputClasses + ' resize-none'}
                          />
                        </div>

                        {/* Issuer Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClasses}>Nombre del Emisor</label>
                            <input
                              type="text"
                              value={course.certification?.issuerName || ''}
                              onChange={(e) => handleCertificationFieldChange('issuerName', e.target.value)}
                              placeholder="Ej: Sovra Academy"
                              className={inputClasses}
                            />
                          </div>

                          <div>
                            <label className={labelClasses}>Email del Emisor</label>
                            <input
                              type="email"
                              value={course.certification?.issuerEmail || ''}
                              onChange={(e) => handleCertificationFieldChange('issuerEmail', e.target.value)}
                              placeholder="Ej: certifications@sovra.io"
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </>
                    )}
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

      {/* Module Type Selector */}
      <ModuleTypeSelectorModal
        isOpen={showModuleTypeSelector}
        onClose={() => setShowModuleTypeSelector(false)}
        onSelect={handleModuleTypeSelected}
      />

      {/* Module Editor */}
      {editingModuleId && (
        <ModuleEditorModal
          isOpen={!!editingModuleId}
          onClose={() => setEditingModuleId(null)}
          onSave={handleModuleSave}
          module={
            course.modules?.find((m) => m.id === editingModuleId) ||
            ({} as EnhancedCourseModule)
          }
        />
      )}
    </AnimatePresence>
  );
}
