'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  GraduationCap,
  Video,
  FileText,
  HelpCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Users,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SovraLoader } from '@/components/ui';
import { CourseEditorModal } from '@/components/sovra/training/CourseEditorModal';
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

interface CourseCardProps {
  course: TrainingCourse;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}

function CourseCard({ course, onEdit, onPublish, onUnpublish, onDelete }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = categoryConfig[course.category];
  const level = levelConfig[course.level];

  // Count lesson types across all modules
  let videoCount = 0;
  let readingCount = 0;
  let quizCount = 0;

  for (const module of course.modules || []) {
    for (const lesson of module.lessons || []) {
      if (lesson.type === 'video') videoCount++;
      if (lesson.type === 'reading') readingCount++;
    }
    if (module.quiz && module.quiz.length > 0) quizCount++;
  }

  const moduleTypes = {
    video: videoCount,
    document: readingCount,
    quiz: quizCount,
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 hover:border-[var(--color-primary)]/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2">
            {course.title?.es || 'Sin título'}
          </h3>
        </div>
        <div className="relative ml-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-[var(--color-border)] z-50 py-1 min-w-[140px]"
                >
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  {course.isPublished ? (
                    <button
                      onClick={() => { setMenuOpen(false); onUnpublish(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                    >
                      <Globe className="w-4 h-4" />
                      Despublicar
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); onPublish(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <Globe className="w-4 h-4" />
                      Publicar
                    </button>
                  )}
                  <hr className="border-[var(--color-border)]" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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
        {moduleTypes.video > 0 && (
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            {moduleTypes.video} video{moduleTypes.video > 1 ? 's' : ''}
          </span>
        )}
        {moduleTypes.document > 0 && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {moduleTypes.document} doc{moduleTypes.document > 1 ? 's' : ''}
          </span>
        )}
        {moduleTypes.quiz > 0 && (
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            {moduleTypes.quiz} quiz{moduleTypes.quiz > 1 ? 'zes' : ''}
          </span>
        )}
        {course.modules.length === 0 && (
          <span className="text-[var(--color-text-muted)]">Sin modulos</span>
        )}
      </div>

    </div>
  );
}

export default function TrainingAdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('trainingCenter');
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sovra/training/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Filter by category and search
  const filteredCourses = courses.filter((course) => {
    if (filterCategory && course.category !== filterCategory) return false;
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
          <p className="text-[var(--color-text-secondary)]">Gestiona los cursos de capacitacion para partners</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/sovra/dashboard/training/analytics`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </Link>
          <button
            onClick={() => {
              setEditingCourseId(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] !text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </button>
        </div>
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

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
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
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
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
            onClick={() => {
              setEditingCourseId(null);
              setModalOpen(true);
            }}
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
              onEdit={() => {
                setEditingCourseId(course.id);
                setModalOpen(true);
              }}
              onPublish={() => handlePublish(course.id)}
              onUnpublish={() => handleUnpublish(course.id)}
              onDelete={() => handleDelete(course.id)}
            />
          ))}
        </div>
      )}

      {/* Course Editor Modal */}
      <CourseEditorModal
        isOpen={modalOpen}
        courseId={editingCourseId || undefined}
        onClose={() => {
          setModalOpen(false);
          setEditingCourseId(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditingCourseId(null);
          fetchCourses();
        }}
      />
    </div>
  );
}
