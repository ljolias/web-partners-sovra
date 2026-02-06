'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Loader2,
  X,
  TrendingUp,
} from 'lucide-react';
import {
  OverviewMetrics,
  CredentialStats,
  EnrollmentChart,
  CompletionChart,
  CoursePerformanceTable,
  DateRangeFilter,
} from '@/components/sovra/analytics';

// ============================================
// Type Definitions
// ============================================

/**
 * Overview data returned from the analytics overview API
 */
interface OverviewData {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  totalCertifications: number;
  credentialStats: CredentialStatsData;
}

/**
 * Credential statistics for the credential stats component
 */
interface CredentialStatsData {
  totalIssued: number;
  claimRate: number;
  averageClaimTimeHours: number;
  pending: number;
  expiringIn30Days: number;
}

/**
 * Course analytics data for the performance table
 */
interface CourseAnalytic {
  courseId: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number;
  moduleCount: number;
  dropoffRate: number;
}

/**
 * Time series data point for charts
 */
interface TimeSeriesData {
  date: string;
  count: number;
}

/**
 * Date range preset type
 */
type DateRange = 'today' | '7d' | '30d' | '90d' | 'all';

/**
 * Sort order type for table
 */
type SortOrder = 'asc' | 'desc';

// ============================================
// Constants
// ============================================

const DEFAULT_RANGE_DAYS = 30;

// ============================================
// Helper Functions
// ============================================

/**
 * Gets today's date in ISO format (YYYY-MM-DD)
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Gets a date N days ago in ISO format
 */
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Parses date range from URL parameters
 * Supports:
 *   - ?range=30d (preset)
 *   - ?start=2024-01-01&end=2024-01-31 (custom)
 */
function parseDateRangeFromParams(searchParams: URLSearchParams): {
  startDate: string;
  endDate: string;
  currentRange: DateRange;
} {
  const today = getToday();

  // Check for preset range parameter
  const rangeParam = searchParams.get('range');
  if (rangeParam) {
    switch (rangeParam) {
      case 'today':
        return { startDate: today, endDate: today, currentRange: 'today' };
      case '7d':
        return { startDate: getDaysAgo(7), endDate: today, currentRange: '7d' };
      case '30d':
        return { startDate: getDaysAgo(30), endDate: today, currentRange: '30d' };
      case '90d':
        return { startDate: getDaysAgo(90), endDate: today, currentRange: '90d' };
      case 'all':
        return { startDate: '2000-01-01', endDate: today, currentRange: 'all' };
    }
  }

  // Check for custom date range parameters
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (startParam && endParam) {
    // Validate dates
    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      return {
        startDate: startParam,
        endDate: endParam,
        // Custom range selected
        currentRange: '30d', // Default display for custom
      };
    }
  }

  // Default: last 30 days
  return {
    startDate: getDaysAgo(DEFAULT_RANGE_DAYS),
    endDate: today,
    currentRange: '30d',
  };
}

// ============================================
// Loading Skeleton Components
// ============================================

/**
 * Skeleton loader for the entire page during initial load
 */
function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-border)]/50" />
          <div className="space-y-2">
            <div className="h-7 w-64 rounded bg-[var(--color-border)]/50" />
            <div className="h-4 w-48 rounded bg-[var(--color-border)]/50" />
          </div>
        </div>
        <div className="h-10 w-24 rounded-lg bg-[var(--color-border)]/50" />
      </div>

      {/* Date filter skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-lg bg-[var(--color-border)]/50" />
        ))}
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--color-border)]/50" />
        ))}
      </div>

      {/* Credential stats skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-[var(--color-border)]/50" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[350px] rounded-2xl bg-[var(--color-border)]/50" />
        <div className="h-[350px] rounded-2xl bg-[var(--color-border)]/50" />
      </div>

      {/* Table skeleton */}
      <div className="h-[400px] rounded-2xl bg-[var(--color-border)]/50" />
    </div>
  );
}

// ============================================
// Error Component
// ============================================

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

function ErrorDisplay({ message, onRetry, onDismiss }: ErrorDisplayProps) {
  // Handle Escape key to dismiss error
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onDismiss();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4"
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
        <p className="text-sm text-red-600 mt-1">{message}</p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onRetry}
            className="text-sm text-red-700 font-medium hover:underline inline-flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <span className="text-red-300">|</span>
          <span className="text-xs text-red-500">
            Presiona Esc para cerrar
          </span>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
        aria-label="Cerrar error"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ============================================
// Main Analytics Dashboard Page
// ============================================

/**
 * Analytics Dashboard Page for Training Center
 *
 * Features:
 * - Overview metrics (courses, enrollments, completion rate, certifications)
 * - Credential statistics (issued, claim rate, claim time, pending, expiring)
 * - Enrollment trend chart
 * - Completion trend chart
 * - Course performance table with sorting
 * - Date range filtering with presets and custom picker
 * - Loading states with skeletons
 * - Error handling with retry
 * - Keyboard shortcuts (R for refresh, Esc for close error)
 * - Responsive design
 *
 * A/B Testing Placeholders:
 * - [AB_TEST: alternative_chart_layout] - Can test different chart arrangements
 * - [AB_TEST: metric_card_variants] - Can test different metric card designs
 * - [AB_TEST: date_range_defaults] - Can test different default date ranges
 */
export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  // ============================================
  // Parse Initial Date Range from URL
  // ============================================

  const initialDateRange = useMemo(() => {
    return parseDateRangeFromParams(searchParams);
  }, [searchParams]);

  // ============================================
  // State
  // ============================================

  // Date range state
  const [startDate, setStartDate] = useState<string>(initialDateRange.startDate);
  const [endDate, setEndDate] = useState<string>(initialDateRange.endDate);
  const [currentRange, setCurrentRange] = useState<DateRange>(initialDateRange.currentRange);

  // Loading states (per-endpoint for granular control)
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(true);

  // Combined loading state
  const isLoading = isLoadingOverview || isLoadingCourses || isLoadingEnrollments || isLoadingCompletions;

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [courseData, setCourseData] = useState<CourseAnalytic[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<TimeSeriesData[]>([]);
  const [completionData, setCompletionData] = useState<TimeSeriesData[]>([]);

  // Table sorting state
  const [sortField, setSortField] = useState<string>('completionRate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Initial page load tracking
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // ============================================
  // Data Fetching Functions
  // ============================================

  /**
   * Fetches overview metrics from the API
   */
  const fetchOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const response = await fetch(
        `/api/sovra/training/analytics/overview?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar metricas generales');
      }

      const data = await response.json();
      setOverviewData(data);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingOverview(false);
    }
  }, [startDate, endDate]);

  /**
   * Fetches course performance data from the API
   */
  const fetchCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      const response = await fetch(
        `/api/sovra/training/analytics/courses?startDate=${startDate}&endDate=${endDate}&sortField=${sortField}&sortOrder=${sortOrder}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar datos de cursos');
      }

      const data = await response.json();
      setCourseData(data.courses || []);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingCourses(false);
    }
  }, [startDate, endDate, sortField, sortOrder]);

  /**
   * Fetches enrollment time series data from the API
   */
  const fetchEnrollments = useCallback(async () => {
    setIsLoadingEnrollments(true);
    try {
      const response = await fetch(
        `/api/sovra/training/analytics/timeseries?type=enrollments&startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar datos de inscripciones');
      }

      const data = await response.json();
      setEnrollmentData(data.data || []);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingEnrollments(false);
    }
  }, [startDate, endDate]);

  /**
   * Fetches completion time series data from the API
   */
  const fetchCompletions = useCallback(async () => {
    setIsLoadingCompletions(true);
    try {
      const response = await fetch(
        `/api/sovra/training/analytics/timeseries?type=completions&startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar datos de completaciones');
      }

      const data = await response.json();
      setCompletionData(data.data || []);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingCompletions(false);
    }
  }, [startDate, endDate]);

  /**
   * Fetches all data in parallel
   * Uses Promise.allSettled to handle partial failures gracefully
   */
  const fetchAllData = useCallback(async () => {
    setError(null);

    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
        fetchOverview(),
        fetchCourses(),
        fetchEnrollments(),
        fetchCompletions(),
      ]);

      // Check for any rejections
      const rejectedResults = results.filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected'
      );

      if (rejectedResults.length > 0) {
        // Collect unique error messages
        const errorMessages = rejectedResults.map((r) =>
          r.reason instanceof Error ? r.reason.message : 'Error desconocido'
        );
        const uniqueErrors = [...new Set(errorMessages)];
        setError(uniqueErrors.join('. '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setHasInitiallyLoaded(true);
    }
  }, [fetchOverview, fetchCourses, fetchEnrollments, fetchCompletions]);

  // ============================================
  // Effects
  // ============================================

  /**
   * Initial data fetch on mount
   */
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /**
   * Keyboard shortcuts
   * - R: Refresh data
   * - Esc: Close error message
   */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // R for refresh
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        fetchAllData();
      }

      // Esc to close error
      if (event.key === 'Escape' && error) {
        setError(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fetchAllData, error]);

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handles date range change from the filter component
   */
  const handleDateRangeChange = useCallback((newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    // Determine the range type for the filter component
    const today = getToday();
    if (newStartDate === today && newEndDate === today) {
      setCurrentRange('today');
    } else if (newStartDate === getDaysAgo(7) && newEndDate === today) {
      setCurrentRange('7d');
    } else if (newStartDate === getDaysAgo(30) && newEndDate === today) {
      setCurrentRange('30d');
    } else if (newStartDate === getDaysAgo(90) && newEndDate === today) {
      setCurrentRange('90d');
    } else if (newStartDate === '2000-01-01' && newEndDate === today) {
      setCurrentRange('all');
    }
  }, []);

  /**
   * Handles navigation back to training dashboard
   */
  const handleBack = useCallback(() => {
    router.push(`/${locale}/sovra/dashboard/training`);
  }, [router, locale]);

  /**
   * Handles table sort changes
   * Passes sorting to the API for server-side sorting
   */
  const handleTableSort = useCallback((field: string, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  /**
   * Re-fetch courses when sort changes (after initial load)
   */
  useEffect(() => {
    if (hasInitiallyLoaded) {
      fetchCourses().catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al ordenar');
      });
    }
  }, [sortField, sortOrder, hasInitiallyLoaded, fetchCourses]);

  /**
   * Handles retry after error
   */
  const handleRetry = useCallback(() => {
    setError(null);
    fetchAllData();
  }, [fetchAllData]);

  /**
   * Handles error dismissal
   */
  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // Prepared Data for Components
  // ============================================

  // Overview metrics data (with defaults for loading state)
  const overviewMetricsData = useMemo(() => ({
    totalCourses: overviewData?.totalCourses ?? 0,
    totalEnrollments: overviewData?.totalEnrollments ?? 0,
    averageCompletionRate: overviewData?.averageCompletionRate ?? 0,
    totalCertifications: overviewData?.totalCertifications ?? 0,
  }), [overviewData]);

  // Credential stats data (with defaults for loading state)
  const credentialStatsData = useMemo(() => ({
    totalIssued: overviewData?.credentialStats?.totalIssued ?? 0,
    claimRate: overviewData?.credentialStats?.claimRate ?? 0,
    averageClaimTimeHours: overviewData?.credentialStats?.averageClaimTimeHours ?? 0,
    pending: overviewData?.credentialStats?.pending ?? 0,
    expiringIn30Days: overviewData?.credentialStats?.expiringIn30Days ?? 0,
  }), [overviewData]);

  // Course performance table data
  const courseTableData = useMemo(() => {
    return courseData.map((course) => ({
      courseId: course.courseId,
      title: course.title,
      status: course.status,
      enrollments: course.enrollments,
      completionRate: course.completionRate,
      averageScore: course.averageScore,
      dropoffRate: course.dropoffRate,
    }));
  }, [courseData]);

  // ============================================
  // Render
  // ============================================

  // Show full page skeleton on initial load
  if (!hasInitiallyLoaded && isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen"
      >
        <PageLoadingSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ============================================ */}
      {/* Header Section */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Title and Back Button */}
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Volver al dashboard de entrenamiento"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-[var(--color-primary)]" />
              Analiticas de Entrenamiento
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              Metricas y tendencias del centro de entrenamiento
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchAllData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
          title="Actualizar datos (R)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualizar
        </button>
      </div>

      {/* ============================================ */}
      {/* Date Range Filter */}
      {/* ============================================ */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
        <DateRangeFilter
          onDateRangeChange={handleDateRangeChange}
          currentRange={currentRange}
          isLoading={isLoading}
        />
      </div>

      {/* ============================================ */}
      {/* Error Display */}
      {/* ============================================ */}
      <AnimatePresence>
        {error && (
          <ErrorDisplay
            message={error}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* Row 1: Overview Metrics */}
      {/* ============================================ */}
      <section aria-label="Metricas generales">
        <OverviewMetrics
          data={overviewMetricsData}
          isLoading={isLoadingOverview}
        />
      </section>

      {/* ============================================ */}
      {/* Row 1b: Credential Stats */}
      {/* ============================================ */}
      <section aria-label="Estadisticas de credenciales">
        <CredentialStats
          data={credentialStatsData}
          isLoading={isLoadingOverview}
        />
      </section>

      {/* ============================================ */}
      {/* Row 2: Charts (Responsive Grid) */}
      {/* [AB_TEST: alternative_chart_layout] */}
      {/* ============================================ */}
      <section aria-label="Graficos de tendencias">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enrollment Chart - 50% width on desktop, full on mobile */}
          <EnrollmentChart
            data={enrollmentData}
            isLoading={isLoadingEnrollments}
            title="Tendencia de Inscripciones"
          />

          {/* Completion Chart - 50% width on desktop, full on mobile */}
          <CompletionChart
            data={completionData}
            isLoading={isLoadingCompletions}
            title="Tendencia de Completaciones"
          />
        </div>
      </section>

      {/* ============================================ */}
      {/* Row 3: Course Performance Table */}
      {/* ============================================ */}
      <section aria-label="Rendimiento por curso">
        <CoursePerformanceTable
          data={courseTableData}
          onSort={handleTableSort}
          isLoading={isLoadingCourses}
        />
      </section>

      {/* ============================================ */}
      {/* Keyboard Shortcuts Help */}
      {/* ============================================ */}
      <div className="text-center text-xs text-[var(--color-text-muted)] py-4">
        <span className="opacity-50">
          Atajos de teclado:{' '}
          <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-hover)] rounded text-[var(--color-text-secondary)]">R</kbd>
          {' '}para actualizar,{' '}
          <kbd className="px-1.5 py-0.5 bg-[var(--color-surface-hover)] rounded text-[var(--color-text-secondary)]">Esc</kbd>
          {' '}para cerrar errores
        </span>
      </div>
    </motion.div>
  );
}
