/**
 * Training-related utility functions
 */

export interface LocalizedString {
  en?: string;
  es?: string;
  pt?: string;
  [key: string]: string | undefined;
}

/**
 * Gets localized text with fallback logic
 */
export function getLocalizedText(
  localized: LocalizedString | string,
  locale: string
): string {
  if (typeof localized === 'string') {
    return localized;
  }

  return (
    localized[locale] ||
    localized.en ||
    localized.es ||
    localized.pt ||
    Object.values(localized).find((v) => v) ||
    ''
  );
}

/**
 * Calculates progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  if (completed >= total) return 100;
  return Math.round((completed / total) * 100);
}

/**
 * Formats duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Checks if a certification is valid (not expired)
 */
export function isCertificationValid(
  expiresAt?: string | Date | null
): boolean {
  if (!expiresAt) return true; // No expiration
  const expirationDate = new Date(expiresAt);
  return expirationDate > new Date();
}
