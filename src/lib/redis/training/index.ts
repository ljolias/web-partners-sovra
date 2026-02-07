/**
 * Training System Analytics - Module Index
 * Provides comprehensive analytics and data retrieval for the Training Center
 *
 * This module uses Upstash Redis REST API for all operations.
 */

// Export all types
export type {
  ModuleDropoffRate,
  CourseDetailedAnalytics,
  TimeSeriesDataPoint,
  CredentialClaimAnalytics,
  TrainingOverviewMetrics,
  EnhancedTrainingProgress,
  ModuleProgress,
  TrainingCertificationRecord,
} from './types';

// Export keys and constants
export { trainingKeys, CACHE_TTL } from './keys';

// Export helper functions
export {
  safeParseNumber,
  safeParseJSON,
  getDateRange,
  calculatePercentage,
  getLocalizedName,
} from './helpers';

// Export enrollment operations
export {
  getCourseEnrollments,
  getCourseEnrollmentCount,
  getCourseCompletions,
  getCourseCompletionCount,
  getUserCourseProgressData,
  recordEnrollment,
  recordCompletion,
  recordModuleStart,
  recordModuleCompletion,
  saveUserCourseProgress,
} from './enrollments';

// Export analytics functions
export {
  getModuleDropoffRate,
  getCourseModuleDropoffRates,
} from './analytics';

// Export time series functions
export {
  getDailyEnrollmentCounts,
  getDailyCompletionCounts,
  getEnrollmentTimeSeries,
  getCompletionTimeSeries,
} from './timeseries';

// Export certification functions
export {
  getAllTrainingCertifications,
  getCredentialStats,
  issueTrainingCertification,
  updateCertificationStatus,
} from './certifications';

// Export credential analytics
export {
  getCredentialClaimAnalytics,
} from './credentials';

// Export course analytics
export {
  getCourseDetailedAnalytics,
  calculateAverageCompletion,
  getTrainingOverviewMetrics,
  invalidateAllTrainingCaches,
  invalidateCourseCache,
} from './courses';

// Export enhanced course functions
export {
  getAllEnhancedCourses,
  getEnhancedCoursesByStatus,
} from './enhanced';
