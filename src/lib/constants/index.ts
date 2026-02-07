/**
 * Shared constants used across the application
 */

export const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
] as const;

export const GOVERNMENT_LEVELS = [
  { value: 'municipality', label: 'Municipio' },
  { value: 'province', label: 'Provincia / Estado' },
  { value: 'nation', label: 'Nacional' },
] as const;

export const CACHE_TTL = {
  ANALYTICS: 5 * 60, // 5 minutes
  OVERVIEW: 10 * 60, // 10 minutes
  CREDENTIALS: 5 * 60, // 5 minutes
  TIMESERIES: 15 * 60, // 15 minutes
  DEALS: 5 * 60, // 5 minutes
  DOCUMENTS: 10 * 60, // 10 minutes
} as const;

export const PARTNER_TIERS = ['bronze', 'silver', 'gold', 'platinum'] as const;
export type PartnerTier = (typeof PARTNER_TIERS)[number];

export const COURSE_CATEGORIES = [
  'sales',
  'technical',
  'legal',
  'product',
] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const DEAL_STATUSES = {
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
  REJECTED: 'rejected',
} as const;

export type DealStatus = (typeof DEAL_STATUSES)[keyof typeof DEAL_STATUSES];

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  pending_approval: 'Pendiente de Aprobación',
  approved: 'Aprobada',
  in_progress: 'En Progreso',
  closed_won: 'Ganada',
  closed_lost: 'Perdida',
  rejected: 'Rechazada',
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  pending_approval: 'yellow',
  approved: 'blue',
  in_progress: 'purple',
  closed_won: 'green',
  closed_lost: 'red',
  rejected: 'gray',
};

export const COMMISSION_TIERS = [
  { min: 0, max: 10000, rate: 0.1 },
  { min: 10000, max: 50000, rate: 0.15 },
  { min: 50000, max: 100000, rate: 0.2 },
  { min: 100000, max: Infinity, rate: 0.25 },
] as const;
