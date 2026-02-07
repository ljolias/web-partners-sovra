/**
 * Training System Redis Key Generators
 * Centralized key management for all training-related Redis operations
 */

export const trainingKeys = {
  // Course enrollment set (stores user IDs)
  courseEnrollments: (courseId: string) => `training:enrollments:${courseId}`,

  // Course completions set (stores user IDs)
  courseCompletions: (courseId: string) => `training:completions:${courseId}`,

  // Module enrollments (users who started a module)
  moduleEnrollments: (courseId: string, moduleId: string) =>
    `training:module:enrolled:${courseId}:${moduleId}`,

  // Module completions (users who completed a module)
  moduleCompletions: (courseId: string, moduleId: string) =>
    `training:module:completed:${courseId}:${moduleId}`,

  // User's course progress hash
  userCourseProgress: (userId: string, courseId: string) =>
    `training:progress:${userId}:${courseId}`,

  // Daily enrollment count
  enrollmentByDate: (date: string) => `training:enrollment:date:${date}`,

  // Daily completion count
  completionByDate: (date: string) => `training:completion:date:${date}`,

  // Enrollment time series sorted set
  enrollmentTimeseries: () => `training:enrollment:timeseries`,

  // Completion time series sorted set
  completionTimeseries: () => `training:completion:timeseries`,

  // All training certifications set
  allTrainingCertifications: () => `training:certifications:all`,

  // Certification data hash
  trainingCertification: (certId: string) => `training:certification:${certId}`,

  // Certifications by status
  certificationsByStatus: (status: string) =>
    `training:certifications:status:${status}`,

  // Cache keys
  courseAnalyticsCache: (courseId: string) =>
    `cache:training:analytics:course:${courseId}`,
  overviewMetricsCache: () => `cache:training:analytics:overview`,
  credentialAnalyticsCache: () => `cache:training:analytics:credentials`,
};

// TTL values in seconds
export const CACHE_TTL = {
  ANALYTICS: 5 * 60, // 5 minutes
  OVERVIEW: 10 * 60, // 10 minutes
  CREDENTIALS: 5 * 60, // 5 minutes
};
