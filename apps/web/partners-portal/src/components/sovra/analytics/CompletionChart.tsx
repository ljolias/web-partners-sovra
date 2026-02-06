'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================
// Type Definitions
// ============================================

interface CompletionChartProps {
  /** Array of data points with date and count */
  data: Array<{ date: string; count: number }>;
  /** Show skeleton loader when true */
  isLoading?: boolean;
  /** Chart title */
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

// ============================================
// Skeleton Component
// ============================================

function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-[var(--color-surface)] rounded-2xl border border-white/10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-sm text-[var(--color-text-secondary)]">
          Cargando grafico...
        </span>
      </div>
    </div>
  );
}

// ============================================
// Custom Tooltip Component
// ============================================

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
          {label}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Completados:{' '}
          <span className="font-semibold text-emerald-500">
            {payload[0].value.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

// ============================================
// Main Component
// ============================================

/**
 * CompletionChart - Line chart showing completion trends over time
 *
 * Features:
 * - Responsive container (300px height)
 * - Smooth curve line with emerald color (for completion)
 * - Grid background
 * - Custom tooltip on hover
 * - Legend at bottom
 */
export function CompletionChart({
  data,
  isLoading = false,
  title = 'Tendencia de Completaciones',
}: CompletionChartProps) {
  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse bg-[var(--color-border)]/50 rounded" />
        <ChartSkeleton />
      </div>
    );
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {title}
        </h3>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            No hay datos disponibles para mostrar
          </p>
        </div>
      </div>
    );
  }

  // Format date for display (shorter format)
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: formatDate(item.date),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6"
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        {title}
      </h3>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />

            {/* X Axis - Date labels */}
            <XAxis
              dataKey="displayDate"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />

            {/* Y Axis - Completion count */}
            <YAxis
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-border)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickFormatter={(value) => value.toLocaleString()}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            <Legend
              wrapperStyle={{
                color: 'var(--color-text-secondary)',
                fontSize: '12px',
                paddingTop: '16px',
              }}
            />

            {/* Line - Using emerald color for completions */}
            <Line
              type="monotone"
              dataKey="count"
              name="Completaciones"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ============================================
// Helper Functions
// ============================================

/**
 * Formats a date string to a shorter display format
 * Input: "2024-01-15" or ISO date string
 * Output: "15 Ene" (for Spanish)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}
