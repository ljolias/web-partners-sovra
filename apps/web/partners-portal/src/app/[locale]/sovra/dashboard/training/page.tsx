'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  BarChart3,
  GraduationCap,
  Video,
  FileText,
  HelpCircle,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Clock,
  BookOpen,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Archive,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  EyeOff,
} from 'lucide-react';
import { CourseEditorModal } from '@/components/sovra/training/CourseEditorModal';
import type {
  EnhancedTrainingCourse,
  EnhancedCourseCategory,
  CourseDifficulty,
  CourseStatus,
} from '@/types';

// ============================================
// Constants & Configuration
// ============================================

const CATEGORY_CONFIG: Record<EnhancedCourseCategory, { label: string; color: string; bgColor: string }> = {
  sales: { label: 'Ventas', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  technical: { label: 'Tecnico', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  legal: { label: 'Legal', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  product: { label: 'Producto', color: 'text-green-600', bgColor: 'bg-green-100' },
};

const DIFFICULTY_CONFIG: Record<CourseDifficulty, { label: string; color: string; bgColor: string }> = {
  basic: { label: 'Basico', color: 'text-green-600', bgColor: 'bg-green-100' },
  intermediate: { label: 'Intermedio', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  advanced: { label: 'Avanzado', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const STATUS_CONFIG: Record<CourseStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <FileText className="w-3 h-3" /> },
  published: { label: 'Publicado', color: 'text-green-600', bgColor: 'bg-green-100', icon: <CheckCircle className="w-3 h-3" /> },
  archived: { label: 'Archivado', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <Archive className="w-3 h-3" /> },
};

const ITEMS_PER_PAGE = 12;

type SortField = 'createdAt' | 'title' | 'status' | 'modules';
type SortDirection = 'asc' | 'desc';

// ============================================
// Helper Components
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
}

function Badge({ children, color, bgColor, icon }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${color} ${bgColor}`}>
      {icon}
      {children}
    </span>
  );
}

// Loading skeleton for course cards
function CourseCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--color-surface-hover)]" />
          <div className="h-5 w-40 rounded bg-[var(--color-surface-hover)]" />
        </div>
        <div className="w-8 h-8 rounded bg-[var(--color-surface-hover)]" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded-full bg-[var(--color-surface-hover)]" />
        <div className="h-5 w-20 rounded-full bg-[var(--color-surface-hover)]" />
        <div className="h-5 w-16 rounded-full bg-[var(--color-surface-hover)]" />
      </div>
      <div className="h-4 w-full rounded bg-[var(--color-surface-hover)] mb-2" />
      <div className="h-4 w-3/4 rounded bg-[var(--color-surface-hover)]" />
      <div className="border-t border-[var(--color-border)] pt-3 mt-3 flex gap-4">
        <div className="h-4 w-20 rounded bg-[var(--color-surface-hover)]" />
        <div className="h-4 w-24 rounded bg-[var(--color-surface-hover)]" />
      </div>
    </div>
  );
}

// Confirmation dialog component
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmBtnClasses = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-[var(--color-primary)] hover:opacity-90 text-white';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-md p-6 border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmBtnClasses}`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' :
                  type === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-green-700' :
                    type === 'error' ? 'text-red-700' :
                    'text-blue-700';
  const Icon = type === 'success' ? CheckCircle :
               type === 'error' ? AlertCircle :
               AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-4 left-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColor}`}
    >
      <Icon className={`w-5 h-5 ${textColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>{message}</span>
      <button onClick={onClose} className={`p-1 rounded hover:bg-white/50 ${textColor}`}>
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================
// Course Card Component
// ============================================

interface CourseCardProps {
  course: EnhancedTrainingCourse;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function CourseCard({ course, onEdit, onPublish, onUnpublish, onArchive, onDelete }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [menuOpen]);

  const categoryConfig = CATEGORY_CONFIG[course.category];
  const difficultyConfig = DIFFICULTY_CONFIG[course.level];
  const statusConfig = STATUS_CONFIG[course.status];

  // Count module types
  const moduleTypes = (course.modules || []).reduce(
    (acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalModules = course.modules?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition-shadow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GraduationCap className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
            {course.title.es || course.title.en || 'Sin titulo'}
          </h3>
        </div>

        {/* Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Menu de acciones"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-44 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] z-20 overflow-hidden py-1"
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>

                {course.status === 'draft' && (
                  <button
                    onClick={() => { setMenuOpen(false); onPublish(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50"
                  >
                    <Globe className="w-4 h-4" />
                    Publicar
                  </button>
                )}

                {course.status === 'published' && (
                  <button
                    onClick={() => { setMenuOpen(false); onUnpublish(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50"
                  >
                    <EyeOff className="w-4 h-4" />
                    Despublicar
                  </button>
                )}

                {course.status !== 'archived' && (
                  <button
                    onClick={() => { setMenuOpen(false); onArchive(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50"
                  >
                    <Archive className="w-4 h-4" />
                    Archivar
                  </button>
                )}

                <hr className="my-1 border-[var(--color-border)]" />

                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge color={categoryConfig.color} bgColor={categoryConfig.bgColor}>
          {categoryConfig.label}
        </Badge>
        <Badge color={difficultyConfig.color} bgColor={difficultyConfig.bgColor}>
          {difficultyConfig.label}
        </Badge>
        <Badge color={statusConfig.color} bgColor={statusConfig.bgColor} icon={statusConfig.icon}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
        {course.description.es || course.description.en || 'Sin descripcion'}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {course.estimatedHours}h
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {totalModules} modulo{totalModules !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Module Types */}
      {totalModules > 0 && (
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-2">
          {moduleTypes.video && (
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              {moduleTypes.video}
            </span>
          )}
          {moduleTypes.reading && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {moduleTypes.reading}
            </span>
          )}
          {moduleTypes.quiz && (
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {moduleTypes.quiz}
            </span>
          )}
          {moduleTypes.download && (
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {moduleTypes.download}
            </span>
          )}
        </div>
      )}

      {/* Certification badge */}
      {course.hasCertification && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium">
            <GraduationCap className="w-3 h-3" />
            Emite certificacion
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function TrainingAdminPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // State
  const [courses, setCourses] = useState<EnhancedTrainingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EnhancedCourseCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant: 'danger' | 'primary';
    onConfirm: () => void;
  } | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // Data Fetching
  // ============================================

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const response = await fetch(`/api/sovra/training/courses?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar cursos');
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to close modals
      if (event.key === 'Escape') {
        if (isCreating) setIsCreating(false);
        if (editingCourseId) setEditingCourseId(null);
        if (confirmDialog) setConfirmDialog(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCreating, editingCourseId, confirmDialog]);

  // ============================================
  // Course Actions
  // ============================================

  const handlePublish = async (courseId: string) => {
    try {
      const response = await fetch(`/api/sovra/training/courses/${courseId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al publicar');
      }

      setToast({ message: 'Curso publicado exitosamente', type: 'success' });
      await fetchCourses();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error al publicar', type: 'error' });
    }
  };

  const handleUnpublish = async (courseId: string) => {
    try {
      const response = await fetch(`/api/sovra/training/courses/${courseId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al despublicar');
      }

      setToast({ message: 'Curso despublicado', type: 'success' });
      await fetchCourses();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error al despublicar', type: 'error' });
    }
  };

  const handleArchive = async (courseId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archivar Curso',
      message: 'El curso sera archivado y no sera visible para los partners. Esta accion se puede revertir.',
      confirmLabel: 'Archivar',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const response = await fetch(`/api/sovra/training/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al archivar');
          }

          setToast({ message: 'Curso archivado', type: 'success' });
          await fetchCourses();
        } catch (err) {
          setToast({ message: err instanceof Error ? err.message : 'Error al archivar', type: 'error' });
        } finally {
          setIsConfirmLoading(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDelete = async (courseId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Curso',
      message: 'Esta accion es irreversible. Todo el contenido del curso, incluyendo modulos, quizzes y material de descarga sera eliminado permanentemente.',
      confirmLabel: 'Eliminar',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const response = await fetch(`/api/sovra/training/courses/${courseId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al eliminar');
          }

          setToast({ message: 'Curso eliminado', type: 'success' });
          await fetchCourses();
        } catch (err) {
          setToast({ message: err instanceof Error ? err.message : 'Error al eliminar', type: 'error' });
        } finally {
          setIsConfirmLoading(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleModalSuccess = () => {
    fetchCourses();
    setToast({
      message: editingCourseId ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente',
      type: 'success',
    });
  };

  // ============================================
  // Filtering, Sorting & Pagination
  // ============================================

  // Filter courses by search query
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.title.es?.toLowerCase().includes(query) ||
      course.title.en?.toLowerCase().includes(query) ||
      course.description.es?.toLowerCase().includes(query) ||
      course.description.en?.toLowerCase().includes(query)
    );
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'title':
        comparison = (a.title.es || '').localeCompare(b.title.es || '');
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'modules':
        comparison = (a.modules?.length || 0) - (b.modules?.length || 0);
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Paginate courses
  const totalPages = Math.ceil(sortedCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, sortField, sortDirection]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Centro de Entrenamiento
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Gestiona los cursos de capacitacion para partners
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${locale}/sovra/dashboard/training/analytics`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] transition-colors border border-[var(--color-border)]"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Crear Curso
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar cursos... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EnhancedCourseCategory | 'all')}
              className="px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
            >
              <option value="all">Todas las categorias</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CourseStatus | 'all')}
              className="px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSortChange(sortField)}
              className="p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              title={`Ordenar ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
            >
              <option value="createdAt">Fecha de creacion</option>
              <option value="title">Nombre</option>
              <option value="status">Estado</option>
              <option value="modules">Cantidad de modulos</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchCourses}
            disabled={isLoading}
            className="p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Results summary */}
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            {sortedCourses.length} curso{sortedCourses.length !== 1 ? 's' : ''} encontrado{sortedCourses.length !== 1 ? 's' : ''}
            {searchQuery && ` para "${searchQuery}"`}
          </span>
          {totalPages > 1 && (
            <span>
              Pagina {currentPage} de {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error al cargar cursos</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-3 text-sm text-red-700 font-medium hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sortedCourses.length === 0 && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <GraduationCap className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No se encontraron cursos'
              : 'Sin cursos todavia'}
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Intenta ajustar los filtros o buscar con otros terminos'
              : 'Crea tu primer curso para comenzar a capacitar a los partners'}
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Crear primer curso
            </button>
          )}
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && !error && paginatedCourses.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {paginatedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => course.id && setEditingCourseId(course.id)}
                  onPublish={() => course.id && handlePublish(course.id)}
                  onUnpublish={() => course.id && handleUnpublish(course.id)}
                  onArchive={() => course.id && handleArchive(course.id)}
                  onDelete={() => course.id && handleDelete(course.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Course Editor Modal - Create */}
      <CourseEditorModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Course Editor Modal - Edit */}
      {editingCourseId && (
        <CourseEditorModal
          isOpen={true}
          onClose={() => setEditingCourseId(null)}
          onSuccess={handleModalSuccess}
          courseId={editingCourseId}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          confirmVariant={confirmDialog.confirmVariant}
          isLoading={isConfirmLoading}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
