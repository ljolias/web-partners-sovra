// Helper to convert objects to Redis-compatible format
export function toRedisHash<T extends object>(obj: T): Record<string, string | number | boolean> {
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

// Generate unique IDs using cryptographically secure random
export function generateId(): string {
  const { randomBytes } = require('crypto');
  const timestamp = Date.now();
  const random = randomBytes(6).toString('base64url');
  return `${timestamp}-${random}`;
}
