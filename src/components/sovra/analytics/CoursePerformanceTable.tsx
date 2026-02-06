'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// ============================================
// Type Definitions
// ============================================

type SortField = 'title' | 'status' | 'enrollments' | 'completionRate' | 'averageScore' | 'dropoffRate';
type SortOrder = 'asc' | 'desc';
type CourseStatus = 'draft' | 'published' | 'archived';

interface CourseData {
  courseId: string;
  title: string;
  status: CourseStatus;
  enrollments: number;
  completionRate: number;
  averageScore: number;
  dropoffRate: number;
}

interface CoursePerformanceTableProps {
  /** Array of course performance data */
  data: CourseData[];
  /** Callback when sort changes (field, order) */
  onSort?: (field: string, order: SortOrder) => void;
  /** Show skeleton loader when true */
  isLoading?: boolean;
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: CourseStatus }) {
  const statusConfig: Record<CourseStatus, { label: string; classes: string }> = {
    draft: {
      label: 'Borrador',
      classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    published: {
      label: 'Publicado',
      classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    archived: {
      label: 'Archivado',
      classes: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

// ============================================
// Rate Indicator Component
// ============================================

/**
 * Displays a percentage with color coding
 * Green: > 70%
 * Yellow: 40-70%
 * Red: < 40%
 */
function RateIndicator({ value, inverted = false }: { value: number; inverted?: boolean }) {
  // For inverted metrics (like dropoff rate), lower is better
  let colorClass: string;

  if (inverted) {
    if (value < 30) {
      colorClass = 'text-emerald-500';
    } else if (value < 50) {
      colorClass = 'text-amber-500';
    } else {
      colorClass = 'text-red-500';
    }
  } else {
    if (value >= 70) {
      colorClass = 'text-emerald-500';
    } else if (value >= 40) {
      colorClass = 'text-amber-500';
    } else {
      colorClass = 'text-red-500';
    }
  }

  return (
    <span className={`font-medium ${colorClass}`}>
      {value.toFixed(1)}%
    </span>
  );
}

// ============================================
// Sort Header Component
// ============================================

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentSort: SortField | null;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortHeader({ label, field, currentSort, currentOrder, onSort }: SortHeaderProps) {
  const isActive = currentSort === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider hover:text-[var(--color-text-primary)] transition-colors group"
    >
      {label}
      <span className="text-[var(--color-text-secondary)] opacity-50 group-hover:opacity-100">
        {isActive ? (
          currentOrder === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        ) : (
          <ChevronsUpDown className="w-4 h-4" />
        )}
      </span>
    </button>
  );
}

// ============================================
// Skeleton Row Component
// ============================================

function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="px-4 py-4">
        <div className="h-4 w-40 animate-pulse bg-[var(--color-border)]/50 rounded" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-20 animate-pulse bg-[var(--color-border)]/50 rounded-full" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-12 animate-pulse bg-[var(--color-border)]/50 rounded" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-14 animate-pulse bg-[var(--color-border)]/50 rounded" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-10 animate-pulse bg-[var(--color-border)]/50 rounded" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-14 animate-pulse bg-[var(--color-border)]/50 rounded" />
      </td>
    </tr>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * CoursePerformanceTable - Displays course metrics in a sortable table
 *
 * Columns:
 * - Course title (truncated for long names)
 * - Status badge (Draft/Published/Archived)
 * - Enrollments count
 * - Completion rate (color-coded)
 * - Average score (0-100)
 * - Dropoff rate (color-coded, inverted)
 */
export function CoursePerformanceTable({
  data,
  onSort,
  isLoading = false,
}: CoursePerformanceTableProps) {
  // Local sort state (for internal sorting if no onSort callback)
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  /**
   * Handles column header click for sorting
   */
  const handleSort = (field: SortField) => {
    let newOrder: SortOrder = 'desc';

    if (sortField === field) {
      // Toggle order if clicking same field
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }

    setSortField(field);
    setSortOrder(newOrder);

    // Call external sort handler if provided
    if (onSort) {
      onSort(field, newOrder);
    }
  };

  /**
   * Sorts data locally if no external handler
   */
  const sortedData = onSort
    ? data
    : [...data].sort((a, b) => {
        if (!sortField) return 0;

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--color-surface)] border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Rendimiento por Curso
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Metricas detalladas de cada curso
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          {/* Table Header - Sticky */}
          <thead className="bg-[var(--color-surface-hover)] sticky top-0 z-10">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Nombre"
                  field="title"
                  currentSort={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Estado"
                  field="status"
                  currentSort={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Inscripciones"
                  field="enrollments"
                  currentSort={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Tasa Completacion"
                  field="completionRate"
                  currentSort={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Puntaje Promedio"
                  field="averageScore"
                  currentSort={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Tasa Abandono"
                  field="dropoffRate"
                  currentSort={sortField}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {isLoading ? (
              // Skeleton loading rows
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : sortedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[var(--color-text-secondary)]"
                >
                  No hay cursos disponibles
                </td>
              </tr>
            ) : (
              // Data rows
              sortedData.map((course, index) => (
                <motion.tr
                  key={course.courseId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  {/* Course Title */}
                  <td className="px-4 py-4">
                    <span
                      className="text-sm font-medium text-[var(--color-text-primary)] truncate block max-w-[200px]"
                      title={course.title}
                    >
                      {course.title}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={course.status} />
                  </td>

                  {/* Enrollments */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {course.enrollments.toLocaleString()}
                    </span>
                  </td>

                  {/* Completion Rate */}
                  <td className="px-4 py-4">
                    <RateIndicator value={course.completionRate} />
                  </td>

                  {/* Average Score */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {course.averageScore.toFixed(0)}
                    </span>
                  </td>

                  {/* Dropoff Rate - inverted coloring (lower is better) */}
                  <td className="px-4 py-4">
                    <RateIndicator value={course.dropoffRate} inverted />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      {!isLoading && sortedData.length > 0 && (
        <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Mostrando {sortedData.length} curso{sortedData.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
