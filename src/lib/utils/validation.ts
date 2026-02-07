/**
 * Input validation utilities
 */

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates population number
 */
export function validatePopulation(population: number): boolean {
  return (
    population > 0 &&
    Number.isInteger(population) &&
    population < 2_000_000_000
  );
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes text by trimming and normalizing whitespace
 */
export function sanitizeText(text: string, maxLength = 10000): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

/**
 * Validates that a string contains only safe characters
 */
export function validateSafeString(input: string): boolean {
  const safeRegex = /^[a-zA-Z0-9\s\-.,áéíóúñÁÉÍÓÚÑ]+$/;
  return safeRegex.test(input);
}
