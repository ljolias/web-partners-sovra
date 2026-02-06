'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, Award } from 'lucide-react';

// ============================================
// Type Definitions
// ============================================

interface OverviewMetricsProps {
  /** Data containing the key metrics to display */
  data: {
    totalCourses: number;
    totalEnrollments: number;
    averageCompletionRate: number;
    totalCertifications: number;
  };
  /** Show skeleton loader when true */
  isLoading?: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  suffix?: string;
  isLoading?: boolean;
  delay?: number;
}

// ============================================
// Skeleton Component
// ============================================

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-border)]/50 rounded ${className || ''}`}
    />
  );
}

// ============================================
// Metric Card Component
// ============================================

function MetricCard({ icon, iconColor, label, value, suffix, isLoading, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 transition-all duration-200 hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-8" />
        </div>
      ) : (
        <>
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconColor} mb-4`}
          >
            {icon}
          </div>

          {/* Label */}
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            {label}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span className="text-lg text-[var(--color-text-secondary)]">
                {suffix}
              </span>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * OverviewMetrics - Displays 4 key metric cards in a responsive grid
 *
 * Shows:
 * - Total Courses (BookOpen icon)
 * - Total Enrollments (Users icon)
 * - Average Completion Rate (TrendingUp icon, %)
 * - Total Certifications (Award icon)
 */
export function OverviewMetrics({ data, isLoading = false }: OverviewMetricsProps) {
  // Define the metrics configuration
  const metrics = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      iconColor: 'bg-blue-500/10 text-blue-500',
      label: 'Total Cursos',
      value: data.totalCourses,
    },
    {
      icon: <Users className="w-6 h-6" />,
      iconColor: 'bg-green-500/10 text-green-500',
      label: 'Inscripciones',
      value: data.totalEnrollments,
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      iconColor: 'bg-purple-500/10 text-purple-500',
      label: 'Completacion Promedio',
      value: data.averageCompletionRate,
      suffix: '%',
    },
    {
      icon: <Award className="w-6 h-6" />,
      iconColor: 'bg-amber-500/10 text-amber-500',
      label: 'Certificaciones',
      value: data.totalCertifications,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          iconColor={metric.iconColor}
          label={metric.label}
          value={metric.value}
          suffix={metric.suffix}
          isLoading={isLoading}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
