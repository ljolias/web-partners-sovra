'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Check } from 'lucide-react';

// ============================================
// Type Definitions
// ============================================

type DateRange = 'today' | '7d' | '30d' | '90d' | 'all';

interface DateRangeFilterProps {
  /** Callback when date range changes (startDate, endDate in ISO format) */
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  /** Currently selected preset range */
  currentRange?: DateRange;
  /** Show loading indicator when true */
  isLoading?: boolean;
}

// ============================================
// Constants
// ============================================

const PRESET_OPTIONS: Array<{ id: DateRange; label: string; days?: number }> = [
  { id: 'today', label: 'Hoy', days: 0 },
  { id: '7d', label: 'Ultimos 7 dias', days: 7 },
  { id: '30d', label: 'Ultimos 30 dias', days: 30 },
  { id: '90d', label: 'Ultimos 90 dias', days: 90 },
  { id: 'all', label: 'Todo el tiempo' },
];

const MAX_CUSTOM_RANGE_DAYS = 365;

// ============================================
// Helper Functions
// ============================================

/**
 * Returns ISO date string for today
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns ISO date string for N days ago
 */
function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Calculates the difference in days between two dates
 */
function getDaysDifference(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// Main Component
// ============================================

/**
 * DateRangeFilter - Filter component for date range selection
 *
 * Features:
 * - Preset buttons: Today, 7 days, 30 days, 90 days, All time
 * - Custom date range picker with validation
 * - Start date must be <= end date
 * - Maximum 365 days range for custom dates
 */
export function DateRangeFilter({
  onDateRangeChange,
  currentRange = '30d',
  isLoading = false,
}: DateRangeFilterProps) {
  // State
  const [activeRange, setActiveRange] = useState<DateRange | 'custom'>(currentRange);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(getDaysAgo(30));
  const [customEnd, setCustomEnd] = useState(getToday());
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Validates custom date range
   */
  const validateCustomRange = useCallback((start: string, end: string): boolean => {
    // Check if start is before or equal to end
    if (new Date(start) > new Date(end)) {
      setValidationError('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      return false;
    }

    // Check max range
    const daysDiff = getDaysDifference(start, end);
    if (daysDiff > MAX_CUSTOM_RANGE_DAYS) {
      setValidationError(`El rango maximo es de ${MAX_CUSTOM_RANGE_DAYS} dias`);
      return false;
    }

    setValidationError(null);
    return true;
  }, []);

  /**
   * Handles preset button click
   */
  const handlePresetClick = useCallback((preset: DateRange) => {
    setActiveRange(preset);
    setShowCustom(false);
    setValidationError(null);

    if (!onDateRangeChange) return;

    const today = getToday();

    switch (preset) {
      case 'today':
        onDateRangeChange(today, today);
        break;
      case '7d':
        onDateRangeChange(getDaysAgo(7), today);
        break;
      case '30d':
        onDateRangeChange(getDaysAgo(30), today);
        break;
      case '90d':
        onDateRangeChange(getDaysAgo(90), today);
        break;
      case 'all':
        // For "all time", use a very old date as start
        onDateRangeChange('2000-01-01', today);
        break;
    }
  }, [onDateRangeChange]);

  /**
   * Opens custom date picker
   */
  const handleCustomClick = useCallback(() => {
    setShowCustom(true);
    setActiveRange('custom');
  }, []);

  /**
   * Applies custom date range
   */
  const handleApplyCustom = useCallback(() => {
    if (!validateCustomRange(customStart, customEnd)) {
      return;
    }

    if (onDateRangeChange) {
      onDateRangeChange(customStart, customEnd);
    }

    setShowCustom(false);
  }, [customStart, customEnd, validateCustomRange, onDateRangeChange]);

  /**
   * Cancels custom date selection
   */
  const handleCancelCustom = useCallback(() => {
    setShowCustom(false);
    setValidationError(null);
    // Revert to previous preset if available
    if (currentRange && currentRange !== 'all') {
      setActiveRange(currentRange);
    } else {
      setActiveRange('30d');
    }
  }, [currentRange]);

  /**
   * Handles custom start date change
   */
  const handleStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomStart(value);
    if (value && customEnd) {
      validateCustomRange(value, customEnd);
    }
  }, [customEnd, validateCustomRange]);

  /**
   * Handles custom end date change
   */
  const handleEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomEnd(value);
    if (customStart && value) {
      validateCustomRange(customStart, value);
    }
  }, [customStart, validateCustomRange]);

  // Memoized max date for inputs (today)
  const maxDate = useMemo(() => getToday(), []);

  return (
    <div className="space-y-4">
      {/* Preset Buttons Row */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_OPTIONS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            disabled={isLoading}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${activeRange === preset.id && !showCustom
                ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-white/10 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text-primary)]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {preset.label}
          </button>
        ))}

        {/* Custom Button */}
        <button
          onClick={handleCustomClick}
          disabled={isLoading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${showCustom || activeRange === 'custom'
              ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-white/10 hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text-primary)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <Calendar className="w-4 h-4" />
          Personalizado
        </button>
      </div>

      {/* Custom Date Picker Panel */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--color-surface)] border border-white/10 rounded-xl p-4 space-y-4">
              {/* Date Inputs Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Start Date */}
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={handleStartChange}
                    max={maxDate}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Separator */}
                <span className="hidden sm:block text-[var(--color-text-secondary)] mt-5">
                  hasta
                </span>

                {/* End Date */}
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={handleEndChange}
                    max={maxDate}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {validationError}
                </motion.p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                <button
                  onClick={handleCancelCustom}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleApplyCustom}
                  disabled={isLoading || !!validationError}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <div className="w-4 h-4 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          Cargando datos...
        </div>
      )}
    </div>
  );
}
