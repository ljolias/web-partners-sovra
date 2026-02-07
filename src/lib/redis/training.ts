/**
 * Training System Redis Analytics Functions
 * Provides comprehensive analytics and data retrieval for the Training Center
 *
 * This module uses Upstash Redis REST API for all operations.
 */

import { redis } from './client';
import { keys } from './keys';
import {
  generateId,
  getTrainingCourse,
  getAllTrainingCourses,
  getPublishedTrainingCourses,
} from './operations';
import type {
  EnhancedTrainingCourse,
  CourseStatus,
  LocalizedString,
} from '@/types';

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ModuleDropoffRate {
  moduleId: string;
  moduleName: string;
  dropoffRate: number; // Percentage of users who started but didn't complete
}

export interface CourseDetailedAnalytics {
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number; // hours
  dropoffRates: ModuleDropoffRate[];
}

export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface CredentialClaimAnalytics {
  totalIssued: number;
  totalClaimed: number;
  claimRate: number;
  averageClaimTimeHours: number;
  pending: number;
  expiringIn30Days: number;
}

export interface TrainingOverviewMetrics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  totalCertifications: number;
}

export interface EnhancedTrainingProgress {
  userId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  moduleProgress: ModuleProgress[];
  overallScore: number;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  totalTimeSpentMinutes: number;
  certificateId?: string;
  certificateIssuedAt?: string;
}

export interface ModuleProgress {
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  startedAt?: string;
  completedAt?: string;
  attempts?: number;
  timeSpentMinutes?: number;
}

export interface TrainingCertificationRecord {
  id: string;
  userId: string;
  courseId: string;
  courseName: LocalizedString;
  userName: string;
  userEmail: string;
  status: 'issued' | 'claimed' | 'expired' | 'revoked';
  issuedAt: string;
  claimedAt?: string;
  expiresAt?: string;
  credentialUrl?: string;
  verificationCode: string;
  score: number;
}

// ============================================================================
// REDIS KEY EXTENSIONS FOR TRAINING ANALYTICS
// ============================================================================

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
const CACHE_TTL = {
  ANALYTICS: 5 * 60, // 5 minutes
  OVERVIEW: 10 * 60, // 10 minutes
  CREDENTIALS: 5 * 60, // 5 minutes
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Safely parse a number from Redis string value
 */
function safeParseNumber(
  value: unknown,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Safely parse JSON from Redis string value
 */
function safeParseJSON<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Generate array of dates between start and end (inclusive)
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return dates;
  }

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate percentage safely (avoids division by zero)
 */
function calculatePercentage(
  numerator: number,
  denominator: number,
  decimals: number = 2
): number {
  if (denominator === 0) return 0;
  const percentage = (numerator / denominator) * 100;
  return Math.round(percentage * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get localized name from LocalizedString object
 */
function getLocalizedName(
  localized: LocalizedString | undefined,
  fallback: string = ''
): string {
  if (!localized) return fallback;
  return localized.en || localized.es || localized.pt || fallback;
}

// ============================================================================
// ENROLLMENT & COMPLETION DATA FUNCTIONS
// ============================================================================

/**
 * Get all enrolled user IDs for a course
 * @param courseId - The course ID
 * @returns Array of user IDs enrolled in the course
 */
export async function getCourseEnrollments(courseId: string): Promise<string[]> {
  const userIds = await redis.smembers<string[]>(
    trainingKeys.courseEnrollments(courseId)
  );
  return userIds || [];
}

/**
 * Get count of enrolled users for a course
 * @param courseId - The course ID
 * @returns Number of enrolled users
 */
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  const count = await redis.scard(trainingKeys.courseEnrollments(courseId));
  return count || 0;
}

/**
 * Get all user IDs who completed a course
 * @param courseId - The course ID
 * @returns Array of user IDs who completed the course
 */
export async function getCourseCompletions(courseId: string): Promise<string[]> {
  const userIds = await redis.smembers<string[]>(
    trainingKeys.courseCompletions(courseId)
  );
  return userIds || [];
}

/**
 * Get count of users who completed a course
 * @param courseId - The course ID
 * @returns Number of completions
 */
export async function getCourseCompletionCount(courseId: string): Promise<number> {
  const count = await redis.scard(trainingKeys.courseCompletions(courseId));
  return count || 0;
}

/**
 * Get user's progress for a specific course
 * @param userId - The user ID
 * @param courseId - The course ID
 * @returns The user's progress or null
 */
export async function getUserCourseProgressData(
  userId: string,
  courseId: string
): Promise<EnhancedTrainingProgress | null> {
  const data = await redis.hgetall(
    trainingKeys.userCourseProgress(userId, courseId)
  );

  if (!data || Object.keys(data).length === 0) return null;

  return {
    userId,
    courseId,
    status:
      (data.status as EnhancedTrainingProgress['status']) || 'not_started',
    moduleProgress: safeParseJSON(data.moduleProgress as string, []),
    overallScore: safeParseNumber(data.overallScore),
    startedAt: (data.startedAt as string) || '',
    completedAt: data.completedAt as string | undefined,
    lastAccessedAt: (data.lastAccessedAt as string) || '',
    totalTimeSpentMinutes: safeParseNumber(data.totalTimeSpentMinutes),
    certificateId: data.certificateId as string | undefined,
    certificateIssuedAt: data.certificateIssuedAt as string | undefined,
  };
}

// ============================================================================
// MODULE ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Calculate dropoff rate for a specific module
 * Dropoff rate = (users who started but didn't complete) / (users who started) * 100
 * @param courseId - The course ID
 * @param moduleId - The module ID
 * @returns Dropoff rate percentage (0-100)
 */
export async function getModuleDropoffRate(
  courseId: string,
  moduleId: string
): Promise<number> {
  const [enrolled, completed] = await Promise.all([
    redis.scard(trainingKeys.moduleEnrollments(courseId, moduleId)),
    redis.scard(trainingKeys.moduleCompletions(courseId, moduleId)),
  ]);

  const enrolledCount = enrolled || 0;
  const completedCount = completed || 0;

  if (enrolledCount === 0) return 0;

  const dropoff = enrolledCount - completedCount;
  return calculatePercentage(dropoff, enrolledCount);
}

/**
 * Get dropoff rates for all modules in a course
 */
async function getCourseModuleDropoffRates(
  courseId: string
): Promise<ModuleDropoffRate[]> {
  const course = await getTrainingCourse(courseId);

  if (!course || !course.modules || course.modules.length === 0) {
    return [];
  }

  const dropoffRates: ModuleDropoffRate[] = [];

  // Fetch all module enrollment and completion counts in parallel
  const pipeline = redis.pipeline();
  for (const module of course.modules) {
    pipeline.scard(trainingKeys.moduleEnrollments(courseId, module.id));
    pipeline.scard(trainingKeys.moduleCompletions(courseId, module.id));
  }

  const results = await pipeline.exec();

  for (let i = 0; i < course.modules.length; i++) {
    const module = course.modules[i];
    const enrolled = safeParseNumber(results[i * 2] as number);
    const completed = safeParseNumber(results[i * 2 + 1] as number);

    const dropoffRate =
      enrolled > 0 ? calculatePercentage(enrolled - completed, enrolled) : 0;

    dropoffRates.push({
      moduleId: module.id,
      moduleName: getLocalizedName(module.title, `Module ${i + 1}`),
      dropoffRate,
    });
  }

  return dropoffRates;
}

// ============================================================================
// TIME SERIES FUNCTIONS
// ============================================================================

/**
 * Get daily enrollment counts within a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getDailyEnrollmentCounts(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dates = getDateRange(startDate, endDate);

  if (dates.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const date of dates) {
    pipeline.get(trainingKeys.enrollmentByDate(date));
  }

  const results = await pipeline.exec();
  const timeSeries: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < dates.length; i++) {
    timeSeries.push({
      date: dates[i],
      count: safeParseNumber(results[i] as number | string | null),
    });
  }

  return timeSeries;
}

/**
 * Get daily completion counts within a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getDailyCompletionCounts(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dates = getDateRange(startDate, endDate);

  if (dates.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const date of dates) {
    pipeline.get(trainingKeys.completionByDate(date));
  }

  const results = await pipeline.exec();
  const timeSeries: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < dates.length; i++) {
    timeSeries.push({
      date: dates[i],
      count: safeParseNumber(results[i] as number | string | null),
    });
  }

  return timeSeries;
}

/**
 * Get enrollment time series
 * Uses daily keys approach first, then falls back to sorted set if available
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getEnrollmentTimeSeries(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dailyCounts = await getDailyEnrollmentCounts(startDate, endDate);

  // If we have data from daily keys, return it
  if (dailyCounts.some((d) => d.count > 0)) {
    return dailyCounts;
  }

  // Fallback: use sorted set if available
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime() + 24 * 60 * 60 * 1000 - 1;

  const entries = await redis.zrange(
    trainingKeys.enrollmentTimeseries(),
    startTimestamp,
    endTimestamp,
    { byScore: true }
  );

  const dateMap = new Map<string, number>();
  const dates = getDateRange(startDate, endDate);

  for (const date of dates) {
    dateMap.set(date, 0);
  }

  if (entries && Array.isArray(entries)) {
    for (const entry of entries) {
      const entryStr = String(entry);
      const timestamp = parseInt(entryStr.split(':')[0]) || 0;
      if (timestamp > 0) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        if (dateMap.has(date)) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      }
    }
  }

  return dates.map((date) => ({
    date,
    count: dateMap.get(date) || 0,
  }));
}

/**
 * Get completion time series
 * Uses daily keys approach first, then falls back to sorted set if available
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getCompletionTimeSeries(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  const dailyCounts = await getDailyCompletionCounts(startDate, endDate);

  if (dailyCounts.some((d) => d.count > 0)) {
    return dailyCounts;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime() + 24 * 60 * 60 * 1000 - 1;

  const entries = await redis.zrange(
    trainingKeys.completionTimeseries(),
    startTimestamp,
    endTimestamp,
    { byScore: true }
  );

  const dateMap = new Map<string, number>();
  const dates = getDateRange(startDate, endDate);

  for (const date of dates) {
    dateMap.set(date, 0);
  }

  if (entries && Array.isArray(entries)) {
    for (const entry of entries) {
      const entryStr = String(entry);
      const timestamp = parseInt(entryStr.split(':')[0]) || 0;
      if (timestamp > 0) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        if (dateMap.has(date)) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      }
    }
  }

  return dates.map((date) => ({
    date,
    count: dateMap.get(date) || 0,
  }));
}

// ============================================================================
// CERTIFICATION FUNCTIONS
// ============================================================================

/**
 * Get all training certifications
 * @returns Array of all certifications
 */
export async function getAllTrainingCertifications(): Promise<
  TrainingCertificationRecord[]
> {
  const certIds = await redis.smembers<string[]>(
    trainingKeys.allTrainingCertifications()
  );

  if (!certIds || certIds.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const id of certIds) {
    pipeline.hgetall(trainingKeys.trainingCertification(id));
  }

  const results = await pipeline.exec();
  const certifications: TrainingCertificationRecord[] = [];

  for (const result of results) {
    if (result && typeof result === 'object' && Object.keys(result).length > 0) {
      const cert = result as unknown as TrainingCertificationRecord;
      if (typeof cert.courseName === 'string') {
        cert.courseName = safeParseJSON(cert.courseName, { en: '' });
      }
      if (typeof cert.score === 'string') {
        cert.score = safeParseNumber(cert.score);
      }
      certifications.push(cert);
    }
  }

  return certifications;
}

/**
 * Get certification statistics
 */
export async function getCredentialStats(): Promise<{
  issued: number;
  claimed: number;
  pending: number;
  expired: number;
}> {
  const [issued, claimed, expired] = await Promise.all([
    redis.scard(trainingKeys.certificationsByStatus('issued')),
    redis.scard(trainingKeys.certificationsByStatus('claimed')),
    redis.scard(trainingKeys.certificationsByStatus('expired')),
  ]);

  const issuedCount = issued || 0;
  const claimedCount = claimed || 0;
  const pending = issuedCount > claimedCount ? issuedCount - claimedCount : 0;

  return {
    issued: issuedCount,
    claimed: claimedCount,
    pending,
    expired: expired || 0,
  };
}

// ============================================================================
// MAIN ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Get detailed analytics for a specific course
 * Includes enrollments, completions, completion rate, average score,
 * average time to complete, and module dropoff rates
 *
 * @param courseId - The course ID
 * @returns Detailed analytics for the course
 */
export async function getCourseDetailedAnalytics(
  courseId: string
): Promise<CourseDetailedAnalytics> {
  // Check cache first
  const cached = await redis.get(trainingKeys.courseAnalyticsCache(courseId));
  if (cached) {
    const cachedData = safeParseJSON<CourseDetailedAnalytics | null>(
      typeof cached === 'string' ? cached : JSON.stringify(cached),
      null
    );
    if (cachedData) {
      return cachedData;
    }
  }

  // Get enrollment and completion counts
  const [enrollments, completions] = await Promise.all([
    getCourseEnrollmentCount(courseId),
    getCourseCompletionCount(courseId),
  ]);

  // Get enrolled user IDs to calculate averages
  const enrolledUserIds = await getCourseEnrollments(courseId);

  let totalScore = 0;
  let totalTimeHours = 0;
  let scoreCount = 0;
  let timeCount = 0;

  // Fetch progress data for all enrolled users
  if (enrolledUserIds.length > 0) {
    const pipeline = redis.pipeline();
    for (const userId of enrolledUserIds) {
      pipeline.hgetall(trainingKeys.userCourseProgress(userId, courseId));
    }

    const progressResults = await pipeline.exec();

    for (const result of progressResults) {
      if (result && typeof result === 'object') {
        const progress = result as Record<string, unknown>;

        // Aggregate scores
        const score = safeParseNumber(progress.overallScore as number | string);
        if (score > 0) {
          totalScore += score;
          scoreCount++;
        }

        // Aggregate completion times (only for completed courses)
        if (progress.completedAt && progress.startedAt) {
          const started = new Date(progress.startedAt as string).getTime();
          const completed = new Date(progress.completedAt as string).getTime();
          if (!isNaN(started) && !isNaN(completed) && completed > started) {
            const hoursToComplete = (completed - started) / (1000 * 60 * 60);
            totalTimeHours += hoursToComplete;
            timeCount++;
          }
        }
      }
    }
  }

  // Calculate module dropoff rates
  const dropoffRates = await getCourseModuleDropoffRates(courseId);

  const analytics: CourseDetailedAnalytics = {
    enrollments,
    completions,
    completionRate: calculatePercentage(completions, enrollments),
    averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
    averageTimeToComplete:
      timeCount > 0 ? Math.round((totalTimeHours / timeCount) * 10) / 10 : 0,
    dropoffRates,
  };

  // Cache the results
  await redis.set(
    trainingKeys.courseAnalyticsCache(courseId),
    JSON.stringify(analytics),
    { ex: CACHE_TTL.ANALYTICS }
  );

  return analytics;
}

/**
 * Get credential claim analytics
 * Includes total issued, claimed, claim rate, average claim time,
 * pending count, and expiring soon count
 *
 * @returns Credential claim analytics
 */
export async function getCredentialClaimAnalytics(): Promise<CredentialClaimAnalytics> {
  // Check cache first
  const cached = await redis.get(trainingKeys.credentialAnalyticsCache());
  if (cached) {
    const cachedData = safeParseJSON<CredentialClaimAnalytics | null>(
      typeof cached === 'string' ? cached : JSON.stringify(cached),
      null
    );
    if (cachedData) {
      return cachedData;
    }
  }

  // Get all certifications for detailed analysis
  const certifications = await getAllTrainingCertifications();

  const totalIssued = certifications.length;
  let totalClaimed = 0;
  let totalClaimTimeHours = 0;
  let claimTimeCount = 0;
  let expiringIn30Days = 0;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const cert of certifications) {
    // Count claimed
    if (cert.status === 'claimed' || cert.claimedAt) {
      totalClaimed++;

      // Calculate claim time
      if (cert.issuedAt && cert.claimedAt) {
        const issued = new Date(cert.issuedAt).getTime();
        const claimed = new Date(cert.claimedAt).getTime();
        if (!isNaN(issued) && !isNaN(claimed) && claimed > issued) {
          totalClaimTimeHours += (claimed - issued) / (1000 * 60 * 60);
          claimTimeCount++;
        }
      }
    }

    // Count expiring soon
    if (cert.expiresAt) {
      const expires = new Date(cert.expiresAt);
      if (expires > now && expires <= thirtyDaysFromNow) {
        expiringIn30Days++;
      }
    }
  }

  const pending = totalIssued - totalClaimed;

  const analytics: CredentialClaimAnalytics = {
    totalIssued,
    totalClaimed,
    claimRate: calculatePercentage(totalClaimed, totalIssued),
    averageClaimTimeHours:
      claimTimeCount > 0
        ? Math.round((totalClaimTimeHours / claimTimeCount) * 10) / 10
        : 0,
    pending: pending > 0 ? pending : 0,
    expiringIn30Days,
  };

  // Cache the results
  await redis.set(
    trainingKeys.credentialAnalyticsCache(),
    JSON.stringify(analytics),
    { ex: CACHE_TTL.CREDENTIALS }
  );

  return analytics;
}

/**
 * Calculate average completion rate across all published courses
 * @returns Average completion rate percentage
 */
export async function calculateAverageCompletion(): Promise<number> {
  const publishedCourses = await getPublishedTrainingCourses();

  if (publishedCourses.length === 0) return 0;

  const pipeline = redis.pipeline();

  for (const course of publishedCourses) {
    pipeline.scard(trainingKeys.courseEnrollments(course.id));
    pipeline.scard(trainingKeys.courseCompletions(course.id));
  }

  const results = await pipeline.exec();
  let totalCompletionRate = 0;
  let validCourses = 0;

  for (let i = 0; i < publishedCourses.length; i++) {
    const enrolled = safeParseNumber(results[i * 2] as number);
    const completed = safeParseNumber(results[i * 2 + 1] as number);

    if (enrolled > 0) {
      totalCompletionRate += calculatePercentage(completed, enrolled);
      validCourses++;
    }
  }

  return validCourses > 0
    ? Math.round((totalCompletionRate / validCourses) * 10) / 10
    : 0;
}

/**
 * Get training overview metrics
 * Includes total courses, published/draft counts, total enrollments,
 * average completion rate, and total certifications
 *
 * @returns Training overview metrics
 */
export async function getTrainingOverviewMetrics(): Promise<TrainingOverviewMetrics> {
  // Check cache first
  const cached = await redis.get(trainingKeys.overviewMetricsCache());
  if (cached) {
    const cachedData = safeParseJSON<TrainingOverviewMetrics | null>(
      typeof cached === 'string' ? cached : JSON.stringify(cached),
      null
    );
    if (cachedData) {
      return cachedData;
    }
  }

  // Get all courses and filter by status
  const allCourses = await getAllTrainingCourses();

  const publishedCourses = allCourses.filter((c) => c.isPublished);
  const draftCourses = allCourses.filter((c) => !c.isPublished);

  // Get total enrollments across all courses
  let totalEnrollments = 0;
  if (allCourses.length > 0) {
    const pipeline = redis.pipeline();
    for (const course of allCourses) {
      pipeline.scard(trainingKeys.courseEnrollments(course.id));
    }
    const enrollmentResults = await pipeline.exec();
    for (const result of enrollmentResults) {
      totalEnrollments += safeParseNumber(result as number);
    }
  }

  // Get average completion rate
  const averageCompletionRate = await calculateAverageCompletion();

  // Get total certifications
  const totalCertifications = await redis.scard(
    trainingKeys.allTrainingCertifications()
  );

  const metrics: TrainingOverviewMetrics = {
    totalCourses: allCourses.length,
    publishedCourses: publishedCourses.length,
    draftCourses: draftCourses.length,
    totalEnrollments,
    averageCompletionRate,
    totalCertifications: totalCertifications || 0,
  };

  // Cache the results
  await redis.set(trainingKeys.overviewMetricsCache(), JSON.stringify(metrics), {
    ex: CACHE_TTL.OVERVIEW,
  });

  return metrics;
}

// ============================================================================
// DATA MUTATION FUNCTIONS (for tracking progress)
// ============================================================================

/**
 * Record a new enrollment
 * @param userId - The user ID
 * @param courseId - The course ID
 */
export async function recordEnrollment(
  userId: string,
  courseId: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await Promise.all([
    redis.sadd(trainingKeys.courseEnrollments(courseId), userId),
    redis.incr(trainingKeys.enrollmentByDate(today)),
    redis.zadd(trainingKeys.enrollmentTimeseries(), {
      score: Date.now(),
      member: `${Date.now()}:${userId}:${courseId}`,
    }),
  ]);

  // Invalidate cache
  await redis.del(trainingKeys.courseAnalyticsCache(courseId));
  await redis.del(trainingKeys.overviewMetricsCache());
}

/**
 * Record a course completion
 * @param userId - The user ID
 * @param courseId - The course ID
 */
export async function recordCompletion(
  userId: string,
  courseId: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await Promise.all([
    redis.sadd(trainingKeys.courseCompletions(courseId), userId),
    redis.incr(trainingKeys.completionByDate(today)),
    redis.zadd(trainingKeys.completionTimeseries(), {
      score: Date.now(),
      member: `${Date.now()}:${userId}:${courseId}`,
    }),
  ]);

  // Invalidate cache
  await redis.del(trainingKeys.courseAnalyticsCache(courseId));
  await redis.del(trainingKeys.overviewMetricsCache());
}

/**
 * Record module start
 * @param userId - The user ID
 * @param courseId - The course ID
 * @param moduleId - The module ID
 */
export async function recordModuleStart(
  userId: string,
  courseId: string,
  moduleId: string
): Promise<void> {
  await redis.sadd(trainingKeys.moduleEnrollments(courseId, moduleId), userId);
  await redis.del(trainingKeys.courseAnalyticsCache(courseId));
}

/**
 * Record module completion
 * @param userId - The user ID
 * @param courseId - The course ID
 * @param moduleId - The module ID
 */
export async function recordModuleCompletion(
  userId: string,
  courseId: string,
  moduleId: string
): Promise<void> {
  await redis.sadd(trainingKeys.moduleCompletions(courseId, moduleId), userId);
  await redis.del(trainingKeys.courseAnalyticsCache(courseId));
}

/**
 * Save or update user's course progress
 * @param progress - The progress data to save
 */
export async function saveUserCourseProgress(
  progress: EnhancedTrainingProgress
): Promise<void> {
  const key = trainingKeys.userCourseProgress(progress.userId, progress.courseId);

  await redis.hset(key, {
    status: progress.status,
    moduleProgress: JSON.stringify(progress.moduleProgress),
    overallScore: progress.overallScore.toString(),
    startedAt: progress.startedAt,
    completedAt: progress.completedAt || '',
    lastAccessedAt: progress.lastAccessedAt,
    totalTimeSpentMinutes: progress.totalTimeSpentMinutes.toString(),
    certificateId: progress.certificateId || '',
    certificateIssuedAt: progress.certificateIssuedAt || '',
  });
}

/**
 * Issue a training certification
 * @param certification - The certification data
 */
export async function issueTrainingCertification(
  certification: TrainingCertificationRecord
): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(trainingKeys.trainingCertification(certification.id), {
    ...certification,
    courseName: JSON.stringify(certification.courseName),
    score: certification.score.toString(),
  });

  pipeline.sadd(trainingKeys.allTrainingCertifications(), certification.id);
  pipeline.sadd(
    trainingKeys.certificationsByStatus(certification.status),
    certification.id
  );

  await pipeline.exec();

  // Invalidate caches
  await redis.del(trainingKeys.credentialAnalyticsCache());
  await redis.del(trainingKeys.overviewMetricsCache());
}

/**
 * Update certification status
 * @param certId - The certification ID
 * @param newStatus - The new status
 * @param updates - Additional fields to update
 */
export async function updateCertificationStatus(
  certId: string,
  newStatus: TrainingCertificationRecord['status'],
  updates?: { claimedAt?: string }
): Promise<void> {
  const certData = await redis.hgetall(trainingKeys.trainingCertification(certId));
  if (!certData) return;

  const oldStatus = certData.status as string;

  const pipeline = redis.pipeline();

  // Update the certification
  pipeline.hset(trainingKeys.trainingCertification(certId), {
    status: newStatus,
    ...(updates?.claimedAt && { claimedAt: updates.claimedAt }),
  });

  // Update status indexes
  if (oldStatus !== newStatus) {
    pipeline.srem(trainingKeys.certificationsByStatus(oldStatus), certId);
    pipeline.sadd(trainingKeys.certificationsByStatus(newStatus), certId);
  }

  await pipeline.exec();

  // Invalidate cache
  await redis.del(trainingKeys.credentialAnalyticsCache());
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Invalidate all training analytics caches
 */
export async function invalidateAllTrainingCaches(): Promise<void> {
  const cacheKeys = [
    trainingKeys.overviewMetricsCache(),
    trainingKeys.credentialAnalyticsCache(),
  ];

  // Get all course analytics cache keys using scan
  let cursor = 0;
  const courseAnalyticsCaches: string[] = [];

  do {
    const [newCursor, keys] = await redis.scan(cursor, {
      match: 'cache:training:analytics:course:*',
      count: 100,
    });
    cursor = typeof newCursor === 'string' ? parseInt(newCursor) : newCursor;
    courseAnalyticsCaches.push(...keys);
  } while (cursor !== 0);

  const allCacheKeys = [...cacheKeys, ...courseAnalyticsCaches];

  if (allCacheKeys.length > 0) {
    await redis.del(...allCacheKeys);
  }
}

/**
 * Invalidate cache for a specific course
 * @param courseId - The course ID
 */
export async function invalidateCourseCache(courseId: string): Promise<void> {
  await Promise.all([
    redis.del(trainingKeys.courseAnalyticsCache(courseId)),
    redis.del(trainingKeys.overviewMetricsCache()),
  ]);
}

// ============================================================================
// ENHANCED COURSE FUNCTIONS (for new training system)
// ============================================================================

/**
 * Get all enhanced courses
 * Maps existing TrainingCourse to EnhancedTrainingCourse format
 */
export async function getAllEnhancedCourses(): Promise<EnhancedTrainingCourse[]> {
  const courses = await getAllTrainingCourses();

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: mapCategoryToEnhanced(course.category),
    level: mapLevelToDifficulty(course.level),
    estimatedHours: Math.ceil(course.duration / 60),
    modules: course.modules.map((m) => {
      // Get first lesson's type if it exists, otherwise 'quiz' if module has quiz
      let type: 'video' | 'reading' | 'quiz' | 'download' = 'reading';
      let videoUrl: string | undefined;
      let content: { en: string } | undefined;

      if (m.lessons && m.lessons.length > 0) {
        const firstLesson = m.lessons[0];
        type = firstLesson.type === 'video' ? 'video' : firstLesson.type === 'download' ? 'download' : 'reading';
        videoUrl = firstLesson.videoUrl;
        if (firstLesson.content) {
          content = { en: typeof firstLesson.content === 'string' ? firstLesson.content : firstLesson.content.en || '' };
        }
      } else if (m.quiz && m.quiz.length > 0) {
        type = 'quiz';
      }

      return {
        id: m.id,
        title: m.title,
        type,
        duration: m.duration || 30,
        order: m.order,
        videoUrl,
        content,
        questions: m.quiz?.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
        passingScore: m.passingScore || course.passingScore,
      };
    }),
    hasCertification: course.certificateEnabled,
    certification: course.certificateEnabled
      ? {
          credentialName: getLocalizedName(course.title),
        }
      : undefined,
    passingScore: course.passingScore,
    status: course.isPublished ? 'published' : 'draft',
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    createdBy: course.createdBy,
  }));
}

/**
 * Get enhanced courses by status
 */
export async function getEnhancedCoursesByStatus(
  status: CourseStatus
): Promise<EnhancedTrainingCourse[]> {
  const allCourses = await getAllEnhancedCourses();
  return allCourses.filter((c) => c.status === status);
}

// Helper functions for mapping types
function mapCategoryToEnhanced(
  category: 'sales' | 'technical' | 'legal' | 'product'
): 'sales' | 'technical' | 'legal' | 'product' {
  return category;
}

function mapLevelToDifficulty(
  level: 'basic' | 'intermediate' | 'advanced'
): 'basic' | 'intermediate' | 'advanced' {
  return level;
}

function mapModuleType(
  type: 'video' | 'document' | 'quiz'
): 'video' | 'reading' | 'quiz' | 'download' {
  if (type === 'document') return 'reading';
  return type;
}
