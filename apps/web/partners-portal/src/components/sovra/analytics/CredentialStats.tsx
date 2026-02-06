'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Percent, Clock, AlertCircle, CalendarClock } from 'lucide-react';

// ============================================
// Type Definitions
// ============================================

interface CredentialStatsProps {
  /** Data containing credential claim metrics */
  data: {
    totalIssued: number;
    claimRate: number;
    averageClaimTimeHours: number;
    pending: number;
    expiringIn30Days: number;
  };
  /** Show skeleton loader when true */
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  suffix?: string;
  description?: string;
  isLoading?: boolean;
  delay?: number;
  size?: 'normal' | 'small';
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
// Stat Card Component
// ============================================

function StatCard({
  icon,
  iconColor,
  label,
  value,
  suffix,
  description,
  isLoading,
  delay = 0,
  size = 'normal',
}: StatCardProps) {
  const isSmall = size === 'small';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className={`bg-[var(--color-surface)] border border-white/10 rounded-2xl ${
        isSmall ? 'p-4' : 'p-6'
      } transition-all duration-200 hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/5`}
    >
      {isLoading ? (
        <div className={`space-y-${isSmall ? '2' : '4'}`}>
          <Skeleton className={`${isSmall ? 'w-8 h-8' : 'w-12 h-12'} rounded-xl`} />
          <Skeleton className={`${isSmall ? 'w-16 h-3' : 'w-24 h-4'}`} />
          <Skeleton className={`${isSmall ? 'w-12 h-6' : 'w-16 h-8'}`} />
        </div>
      ) : (
        <>
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center ${
              isSmall ? 'w-8 h-8 rounded-lg mb-3' : 'w-12 h-12 rounded-xl mb-4'
            } ${iconColor}`}
          >
            {icon}
          </div>

          {/* Label */}
          <p className={`${isSmall ? 'text-xs' : 'text-sm'} text-[var(--color-text-secondary)] mb-1`}>
            {label}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span
              className={`${
                isSmall ? 'text-xl' : 'text-2xl'
              } font-bold text-[var(--color-text-primary)]`}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span
                className={`${
                  isSmall ? 'text-sm' : 'text-lg'
                } text-[var(--color-text-secondary)]`}
              >
                {suffix}
              </span>
            )}
          </div>

          {/* Optional description */}
          {description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-2">
              {description}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * CredentialStats - Displays credential claim metrics
 *
 * Main stats:
 * - Total Issued (number of credentials issued)
 * - Claim Rate (percentage of claims)
 * - Average Claim Time (hours)
 *
 * Secondary stats:
 * - Pending (credentials awaiting claim)
 * - Expiring in 30 Days (credentials expiring soon)
 */
export function CredentialStats({ data, isLoading = false }: CredentialStatsProps) {
  // Main metrics configuration
  const mainMetrics = [
    {
      icon: <BadgeCheck className="w-6 h-6" />,
      iconColor: 'bg-emerald-500/10 text-emerald-500',
      label: 'Emitidas',
      value: data.totalIssued,
      description: 'Credenciales totales emitidas',
    },
    {
      icon: <Percent className="w-6 h-6" />,
      iconColor: 'bg-blue-500/10 text-blue-500',
      label: 'Tasa de Reclamo',
      value: data.claimRate,
      suffix: '%',
      description: 'Porcentaje de credenciales reclamadas',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      iconColor: 'bg-purple-500/10 text-purple-500',
      label: 'Tiempo Promedio',
      value: data.averageClaimTimeHours,
      suffix: 'h',
      description: 'Tiempo promedio para reclamar',
    },
  ];

  // Secondary metrics configuration
  const secondaryMetrics = [
    {
      icon: <AlertCircle className="w-4 h-4" />,
      iconColor: 'bg-amber-500/10 text-amber-500',
      label: 'Pendientes',
      value: data.pending,
    },
    {
      icon: <CalendarClock className="w-4 h-4" />,
      iconColor: 'bg-red-500/10 text-red-500',
      label: 'Expirando en 30 dias',
      value: data.expiringIn30Days,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main metrics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mainMetrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            icon={metric.icon}
            iconColor={metric.iconColor}
            label={metric.label}
            value={metric.value}
            suffix={metric.suffix}
            description={metric.description}
            isLoading={isLoading}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {secondaryMetrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            icon={metric.icon}
            iconColor={metric.iconColor}
            label={metric.label}
            value={metric.value}
            isLoading={isLoading}
            delay={0.3 + index * 0.1}
            size="small"
          />
        ))}
      </div>
    </div>
  );
}
