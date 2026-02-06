/**
 * Redis Key Patterns for Training System
 * Centralized key generation for consistent Redis key management
 */

// ============================================================================
// COURSE KEYS
// ============================================================================

/**
 * Key for storing all course IDs as a set
 */
export const COURSES_ALL = 'courses:all';

/**
 * Key for course data hash
 * @param courseId - The course ID
 */
export const courseData = (courseId: string) => `course:${courseId}`;

/**
 * Key for courses by status set
 * @param status - 'published' | 'draft' | 'archived'
 */
export const coursesByStatus = (status: string) => `courses:status:${status}`;

// ============================================================================
// PROGRESS KEYS
// ============================================================================

/**
 * Key for course enrollments set (stores user IDs)
 * @param courseId - The course ID
 */
export const courseEnrollments = (courseId: string) =>
  `progress:course:${courseId}`;

/**
 * Key for course completions set (stores user IDs)
 * @param courseId - The course ID
 */
export const courseCompletions = (courseId: string) =>
  `progress:completed:${courseId}`;

/**
 * Key for user's module progress hash
 * @param userId - The user ID
 * @param courseId - The course ID
 * @param moduleId - The module ID
 */
export const moduleProgress = (
  userId: string,
  courseId: string,
  moduleId: string
) => `progress:module:${userId}:${courseId}:${moduleId}`;

/**
 * Key for module enrollments set (users who started a module)
 * @param courseId - The course ID
 * @param moduleId - The module ID
 */
export const moduleEnrollments = (courseId: string, moduleId: string) =>
  `progress:module:enrolled:${courseId}:${moduleId}`;

/**
 * Key for module completions set (users who completed a module)
 * @param courseId - The course ID
 * @param moduleId - The module ID
 */
export const moduleCompletions = (courseId: string, moduleId: string) =>
  `progress:module:completed:${courseId}:${moduleId}`;

/**
 * Key for user's course progress hash (score, time, etc.)
 * @param userId - The user ID
 * @param courseId - The course ID
 */
export const userCourseProgress = (userId: string, courseId: string) =>
  `progress:user:${userId}:course:${courseId}`;

// ============================================================================
// TIME SERIES KEYS
// ============================================================================

/**
 * Key for daily enrollment count
 * @param date - Date in YYYY-MM-DD format
 */
export const enrollmentByDate = (date: string) => `enrollment:date:${date}`;

/**
 * Key for daily completion count
 * @param date - Date in YYYY-MM-DD format
 */
export const completionByDate = (date: string) => `completion:date:${date}`;

/**
 * Key for enrollment time series sorted set
 * Score is Unix timestamp, value is enrollment ID
 */
export const ENROLLMENT_TIMESERIES = 'enrollment:timeseries';

/**
 * Key for completion time series sorted set
 * Score is Unix timestamp, value is completion ID
 */
export const COMPLETION_TIMESERIES = 'completion:timeseries';

// ============================================================================
// CERTIFICATION KEYS
// ============================================================================

/**
 * Key for all certifications set
 */
export const CERTIFICATIONS_ALL = 'certifications:all';

/**
 * Key for certification data hash
 * @param certId - The certification ID
 */
export const certificationData = (certId: string) => `certification:${certId}`;

/**
 * Key for certifications by status
 * @param status - 'issued' | 'claimed' | 'expired'
 */
export const certificationsByStatus = (status: string) =>
  `certifications:status:${status}`;

/**
 * Key for user's certifications set
 * @param userId - The user ID
 */
export const userCertifications = (userId: string) =>
  `certifications:user:${userId}`;

// ============================================================================
// ANALYTICS CACHE KEYS
// ============================================================================

/**
 * Key for cached course analytics
 * @param courseId - The course ID
 */
export const courseAnalyticsCache = (courseId: string) =>
  `cache:analytics:course:${courseId}`;

/**
 * Key for cached overview metrics
 */
export const OVERVIEW_METRICS_CACHE = 'cache:analytics:overview';

/**
 * Key for cached credential analytics
 */
export const CREDENTIAL_ANALYTICS_CACHE = 'cache:analytics:credentials';

// ============================================================================
// KEY PATTERNS (for SCAN operations)
// ============================================================================

export const PATTERNS = {
  /** Pattern to match all course data keys */
  ALL_COURSES: 'course:*',

  /** Pattern to match all progress keys */
  ALL_PROGRESS: 'progress:*',

  /** Pattern to match all certification keys */
  ALL_CERTIFICATIONS: 'certification:*',

  /** Pattern to match enrollment date keys */
  ENROLLMENT_DATES: 'enrollment:date:*',

  /** Pattern to match completion date keys */
  COMPLETION_DATES: 'completion:date:*',

  /** Pattern to match course enrollments */
  COURSE_ENROLLMENTS: 'progress:course:*',

  /** Pattern to match course completions */
  COURSE_COMPLETIONS: 'progress:completed:*',

  /** Pattern to match user module progress */
  USER_MODULE_PROGRESS: 'progress:module:*',

  /** Pattern to match module enrollments for a course */
  courseModuleEnrollments: (courseId: string) =>
    `progress:module:enrolled:${courseId}:*`,

  /** Pattern to match module completions for a course */
  courseModuleCompletions: (courseId: string) =>
    `progress:module:completed:${courseId}:*`,
};

// ============================================================================
// TTL CONSTANTS (in seconds)
// ============================================================================

export const TTL = {
  /** Cache analytics for 5 minutes */
  ANALYTICS_CACHE: 5 * 60,

  /** Cache overview metrics for 10 minutes */
  OVERVIEW_CACHE: 10 * 60,

  /** Cache credential analytics for 5 minutes */
  CREDENTIAL_CACHE: 5 * 60,
};
