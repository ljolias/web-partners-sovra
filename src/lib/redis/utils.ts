/**
 * Redis utility functions for common operations
 */

/**
 * Converts an object to Redis hash format
 * Serializes complex types to JSON strings
 */
export function toRedisHash<T extends object>(
  obj: T
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result[key] = '';
    } else if (typeof value === 'object') {
      result[key] = JSON.stringify(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Safely parses a number from Redis (which stores everything as strings)
 */
export function safeParseNumber(
  value: unknown,
  defaultValue = 0
): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Safely parses an integer from Redis
 */
export function safeParseInt(
  value: unknown,
  defaultValue = 0
): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : Math.floor(value);
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Safely parses JSON from Redis
 */
export function safeParseJSON<T>(
  value: string | null | undefined,
  defaultValue: T
): T {
  if (!value || value === '') {
    return defaultValue;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely parses a boolean from Redis
 */
export function safeParseBoolean(
  value: unknown,
  defaultValue = false
): boolean {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return defaultValue;
}

/**
 * Safely parses a date from Redis
 */
export function safeParseDate(
  value: string | null | undefined,
  defaultValue?: Date
): Date | undefined {
  if (!value) {
    return defaultValue;
  }

  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  } catch {
    return defaultValue;
  }
}

/**
 * Converts a Redis hash back to a typed object
 * Automatically parses JSON fields and numbers
 */
export function fromRedisHash<T>(
  hash: Record<string, string>,
  schema?: Partial<Record<keyof T, 'number' | 'boolean' | 'json' | 'date'>>
): T {
  const result: any = { ...hash };

  if (schema) {
    for (const [key, type] of Object.entries(schema)) {
      const value = result[key];

      switch (type) {
        case 'number':
          result[key] = safeParseNumber(value);
          break;
        case 'boolean':
          result[key] = safeParseBoolean(value);
          break;
        case 'json':
          result[key] = safeParseJSON(value, null);
          break;
        case 'date':
          result[key] = safeParseDate(value);
          break;
      }
    }
  }

  return result as T;
}

/**
 * Generates a Redis key with namespace
 */
export function redisKey(...parts: (string | number)[]): string {
  return parts.filter(Boolean).join(':');
}

/**
 * Parses a Redis TTL response
 * Returns null if key doesn't exist or has no expiration
 */
export function parseTTL(ttl: number): number | null {
  if (ttl === -2) return null; // Key doesn't exist
  if (ttl === -1) return null; // Key has no expiration
  return ttl;
}
