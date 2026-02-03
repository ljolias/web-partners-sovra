'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  GraduationCap,
  Video,
  FileText,
  HelpCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Globe,
  Users,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SovraLoader } from '@/components/ui';
import type { TrainingCourse, CourseCategory, CourseLevel, PartnerTier } from '@/types';

const categoryConfig: Record<CourseCategory, { label: string; color: string }> = {
  sales: { label: 'Ventas', color: 'text-blue-600 bg-blue-100' },
  technical: { label: 'Tecnico', color: 'text-purple-600 bg-purple-100' },
  legal: { label: 'Legal', color: 'text-amber-600 bg-amber-100' },
  product: { label: 'Producto', color: 'text-green-600 bg-green-100' },
};

const levelConfig: Record<CourseLevel, { label: string; color: string }> = {
  basic: { label: 'Basico', color: 'text-green-600 bg-green-100' },
  intermediate: { label: 'Intermedio', color: 'text-yellow-600 bg-yellow-100' },
  advanced: { label: 'Avanzado', color: 'text-red-600 bg-red-100' },
};

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_es: '',
    title_en: '',
    title_pt: '',
    description_es: '',
    description_en: '',
    description_pt: '',
    category: 'sales' as CourseCategory,
    level: 'basic' as CourseLevel,
    duration: 30,
    passingScore: 70,
    isRequired: false,
    requiredForTiers: [] as PartnerTier[],
    certificateEnabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sovra/training/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: { es: formData.title_es, en: formData.title_en, pt: formData.title_pt },
          description: { es: formData.description_es, en: formData.description_en, pt: formData.description_pt },
          category: formData.category,
          level: formData.level,
          duration: formData.duration,
          passingScore: formData.passingScore,
          isRequired: formData.isRequired,
          requiredForTiers: formData.isRequired ? formData.requiredForTiers : [],
          certificateEnabled: formData.certificateEnabled,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear curso');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleTierToggle = (tier: PartnerTier) => {
    setFormData(prev => ({
      ...prev,
      requiredForTiers: prev.requiredForTiers.includes(tier)
        ? prev.requiredForTiers.filter(t => t !== tier)
        : [...prev.requiredForTiers, tier],
    }));
  };

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Nuevo Curso</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Title in multiple languages */}
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Titulo del Curso</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Espanol *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_es}
                    onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Fundamentos de Ventas"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Ingles</label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Sales Fundamentals"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Portugues</label>
                    <input
                      type="text"
                      value={formData.title_pt}
                      onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Fundamentos de Vendas"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Descripcion</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Espanol *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.description_es}
                    onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    placeholder="Aprende los conceptos basicos de ventas B2B..."
                  />
                </div>
              </div>
            </div>

            {/* Category, Level, Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Categoria *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CourseCategory })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nivel *</label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as CourseLevel })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {Object.entries(levelConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Duracion (min) *</label>
                <input
                  type="number"
                  required
                  min={5}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Puntaje para aprobar</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Porcentaje minimo para certificar</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                    className="w-20 px-3 py-2 border border-[var(--color-border)] rounded-lg text-center bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Emitir certificado</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Al completar el curso</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.certificateEnabled}
                    onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--color-surface-hover)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Curso obligatorio</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Requerido para ciertos niveles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--color-surface-hover)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>

              {formData.isRequired && (
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">Obligatorio para:</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['bronze', 'silver', 'gold', 'platinum'] as PartnerTier[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleTierToggle(tier)}
                        className={cn(
                          'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                          formData.requiredForTiers.includes(tier)
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                        )}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <SovraLoader size="sm" className="!w-4 !h-4 text-white" />
                    Creando...
                  </>
                ) : (
                  'Crear Curso'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface CourseCardProps {
  course: TrainingCourse & { completedCount?: number; inProgressCount?: number };
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}

function CourseCard({ course, onEdit, onPublish, onUnpublish, onDelete }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const category = categoryConfig[course.category];
  const level = levelConfig[course.level];

  const moduleTypes = course.modules.reduce(
    (acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">{course.title.es || course.title.en}</h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] z-20 overflow-hidden"
                >
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  {course.isPublished ? (
                    <button
                      onClick={() => { setMenuOpen(false); onUnpublish(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50"
                    >
                      <Globe className="w-4 h-4" />
                      Despublicar
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); onPublish(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50"
                    >
                      <Globe className="w-4 h-4" />
                      Publicar
                    </button>
                  )}
                  <hr className="border-[var(--color-border)]" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', category.color)}>
          {category.label}
        </span>
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', level.color)}>
          {level.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <Clock className="w-3 h-3" />
          {course.duration} min
        </span>
        <span className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-full',
          course.isPublished ? 'text-green-600 bg-green-100' : 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]'
        )}>
          {course.isPublished ? 'Publicado' : 'Borrador'}
        </span>
      </div>

      {course.isRequired && course.requiredForTiers && course.requiredForTiers.length > 0 && (
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          Obligatorio para: {course.requiredForTiers.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
        {moduleTypes.video && (
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            {moduleTypes.video} video{moduleTypes.video > 1 ? 's' : ''}
          </span>
        )}
        {moduleTypes.document && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {moduleTypes.document} doc{moduleTypes.document > 1 ? 's' : ''}
          </span>
        )}
        {moduleTypes.quiz && (
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            {moduleTypes.quiz} quiz{moduleTypes.quiz > 1 ? 'zes' : ''}
          </span>
        )}
        {course.modules.length === 0 && (
          <span className="text-[var(--color-text-muted)]">Sin modulos</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3 mt-3">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{course.completedCount || 0} completados</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-primary)]">
          <span>{course.inProgressCount || 0} en progreso</span>
        </div>
      </div>
    </div>
  );
}

export default function TrainingAdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [courses, setCourses] = useState<(TrainingCourse & { completedCount?: number; inProgressCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);

      const response = await fetch(`/api/sovra/training/courses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handlePublish = async (courseId: string) => {
    try {
      await fetch(`/api/sovra/training/courses/${courseId}/publish`, { method: 'POST' });
      await fetchCourses();
    } catch (error) {
      console.error('Error publishing course:', error);
    }
  };

  const handleUnpublish = async (courseId: string) => {
    try {
      await fetch(`/api/sovra/training/courses/${courseId}/unpublish`, { method: 'POST' });
      await fetchCourses();
    } catch (error) {
      console.error('Error unpublishing course:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('¿Estas seguro de eliminar este curso?')) return;

    try {
      await fetch(`/api/sovra/training/courses/${courseId}`, { method: 'DELETE' });
      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  // Filter by search
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.title.es?.toLowerCase().includes(query) ||
      course.title.en?.toLowerCase().includes(query) ||
      course.description.es?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Training Center</h1>
          <p className="text-[var(--color-text-secondary)]">Gestiona los cursos de capacitacion para partners</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] !text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Curso
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterCategory('')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              filterCategory === '' ? 'bg-[var(--color-primary)] !text-white' : 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            )}
          >
            Todos
          </button>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                filterCategory === key ? 'bg-[var(--color-primary)] !text-white' : 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
              )}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <SovraLoader size="md" className="text-[var(--color-primary)] mx-auto" />
          <p className="text-[var(--color-text-secondary)] mt-4">Cargando cursos...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <GraduationCap className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">No se encontraron cursos</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
          >
            Crear primer curso
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => router.push(`/${locale}/sovra/dashboard/training/${course.id}`)}
              onPublish={() => handlePublish(course.id)}
              onUnpublish={() => handleUnpublish(course.id)}
              onDelete={() => handleDelete(course.id)}
            />
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchCourses}
      />
    </div>
  );
}
