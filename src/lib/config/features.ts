/**
 * Feature flags for security features and gradual rollout
 *
 * These flags allow toggling security features via environment variables,
 * useful for gradual rollout, testing, or emergency rollback.
 */

/**
 * Security feature flags
 */
export const SECURITY_FEATURES = {
  /**
   * Enforce certification requirement for deal registration
   * Set ENFORCE_CERTIFICATION=false to disable temporarily
   */
  ENFORCE_CERTIFICATION: process.env.ENFORCE_CERTIFICATION !== 'false',

  /**
   * Enforce legal document signing requirement
   * Set ENFORCE_LEGAL_DOCS=false to disable temporarily
   */
  ENFORCE_LEGAL_DOCS: process.env.ENFORCE_LEGAL_DOCS !== 'false',

  /**
   * Enable rate limiting on API endpoints
   * Set ENABLE_RATE_LIMITING=false to disable temporarily
   */
  RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',

  /**
   * Enable CORS validation
   * Set ENABLE_CORS=false to disable temporarily
   */
  CORS_CHECK: process.env.ENABLE_CORS !== 'false',

  /**
   * Enable XSS protection (HTML sanitization)
   * Set ENABLE_XSS_PROTECTION=false to disable temporarily
   * WARNING: Only disable for debugging!
   */
  XSS_PROTECTION: process.env.ENABLE_XSS_PROTECTION !== 'false',
} as const;

/**
 * Performance feature flags
 */
export const PERFORMANCE_FEATURES = {
  /**
   * Enable query pagination
   * Set ENABLE_PAGINATION=false to disable
   */
  PAGINATION: process.env.ENABLE_PAGINATION !== 'false',

  /**
   * Enable lazy loading for heavy components
   * Set ENABLE_LAZY_LOADING=false to disable
   */
  LAZY_LOADING: process.env.ENABLE_LAZY_LOADING !== 'false',
} as const;

/**
 * Integration feature flags
 */
export const INTEGRATION_FEATURES = {
  /**
   * Enable DocuSign integration
   * Automatically disabled if DOCUSIGN_CLIENT_ID is not set
   */
  DOCUSIGN: !!process.env.DOCUSIGN_CLIENT_ID,

  /**
   * Enable Claude AI (Copilot) integration
   * Automatically disabled if ANTHROPIC_API_KEY is not set
   */
  CLAUDE_COPILOT: !!process.env.ANTHROPIC_API_KEY,

  /**
   * Enable email notifications
   * Automatically disabled if RESEND_API_KEY is not set
   */
  EMAIL_NOTIFICATIONS: !!process.env.RESEND_API_KEY,
} as const;

/**
 * Combined feature flags object
 */
export const FEATURES = {
  ...SECURITY_FEATURES,
  ...PERFORMANCE_FEATURES,
  ...INTEGRATION_FEATURES,
} as const;

/**
 * Log feature flags status on startup (server-side only)
 */
if (typeof window === 'undefined') {
  // Only log in development or if explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.LOG_FEATURES === 'true') {
    console.log('🎛️  Feature Flags:');
    console.log('  Security:');
    console.log(`    - Certification Required: ${SECURITY_FEATURES.ENFORCE_CERTIFICATION}`);
    console.log(`    - Legal Docs Required: ${SECURITY_FEATURES.ENFORCE_LEGAL_DOCS}`);
    console.log(`    - Rate Limiting: ${SECURITY_FEATURES.RATE_LIMITING}`);
    console.log(`    - CORS Check: ${SECURITY_FEATURES.CORS_CHECK}`);
    console.log(`    - XSS Protection: ${SECURITY_FEATURES.XSS_PROTECTION}`);
    console.log('  Integrations:');
    console.log(`    - DocuSign: ${INTEGRATION_FEATURES.DOCUSIGN}`);
    console.log(`    - Claude Copilot: ${INTEGRATION_FEATURES.CLAUDE_COPILOT}`);
    console.log(`    - Email Notifications: ${INTEGRATION_FEATURES.EMAIL_NOTIFICATIONS}`);
  }
}
