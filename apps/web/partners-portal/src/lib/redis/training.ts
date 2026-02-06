/**
 * Training System Redis Analytics Functions
 * Provides comprehensive analytics and data retrieval for the Training Center
 *
 * This module uses Upstash Redis REST API for all operations.
 */

import { getRedisClient } from './client';
import {
  COURSES_ALL,
  courseData,
  coursesByStatus,
  courseEnrollments,
  courseCompletions,
  moduleEnrollments,
  moduleCompletions,
  userCourseProgress,
  enrollmentByDate,
  completionByDate,
  ENROLLMENT_TIMESERIES,
  COMPLETION_TIMESERIES,
  CERTIFICATIONS_ALL,
  certificationData,
  certificationsByStatus,
  courseAnalyticsCache,
  OVERVIEW_METRICS_CACHE,
  CREDENTIAL_ANALYTICS_CACHE,
  PATTERNS,
  TTL,
} from './keys';
import type {
  EnhancedTrainingCourse,
  EnhancedTrainingProgress,
  TrainingCertification,
  CourseDetailedAnalytics,
  TimeSeriesDataPoint,
  CredentialClaimAnalytics,
  TrainingOverviewMetrics,
  ModuleDropoffRate,
  CourseStatus,
} from '@/types/training';

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Safely parse a number from Redis string value
 * @param value - The value from Redis (string or number)
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default
 */
function safeParseNumber(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined) return defaultValue;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse JSON from Redis string value
 * @param value - The JSON string from Redis
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed object or default
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
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date strings in YYYY-MM-DD format
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return dates;
  }

  // Ensure start is before or equal to end
  if (start > end) {
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
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param decimals - Number of decimal places (default 2)
 * @returns Percentage value rounded to decimals, or 0 if denominator is 0
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

// ============================================================================
// COURSE DATA FUNCTIONS
// ============================================================================

/**
 * Get all enhanced courses from Redis
 * @returns Array of all courses
 */
export async function getAllEnhancedCourses(): Promise<EnhancedTrainingCourse[]> {
  const redis = getRedisClient();

  // Get all course IDs from the set
  const courseIds = await redis.smembers(COURSES_ALL);

  if (!courseIds || courseIds.length === 0) {
    return [];
  }

  // Use pipeline to fetch all course data efficiently
  const pipeline = redis.pipeline();
  for (const id of courseIds) {
    pipeline.get(courseData(id));
  }

  const results = await pipeline.exec();
  const courses: EnhancedTrainingCourse[] = [];

  for (const result of results) {
    if (result) {
      const course = safeParseJSON<EnhancedTrainingCourse | null>(
        typeof result === 'string' ? result : JSON.stringify(result),
        null
      );
      if (course) {
        courses.push(course);
      }
    }
  }

  return courses;
}

/**
 * Get courses filtered by status
 * @param status - The course status to filter by
 * @returns Array of courses matching the status
 */
export async function getEnhancedCoursesByStatus(
  status: CourseStatus
): Promise<EnhancedTrainingCourse[]> {
  const redis = getRedisClient();

  // Get course IDs with the specified status
  const courseIds = await redis.smembers(coursesByStatus(status));

  if (!courseIds || courseIds.length === 0) {
    return [];
  }

  // Fetch all course data
  const pipeline = redis.pipeline();
  for (const id of courseIds) {
    pipeline.get(courseData(id));
  }

  const results = await pipeline.exec();
  const courses: EnhancedTrainingCourse[] = [];

  for (const result of results) {
    if (result) {
      const course = safeParseJSON<EnhancedTrainingCourse | null>(
        typeof result === 'string' ? result : JSON.stringify(result),
        null
      );
      if (course) {
        courses.push(course);
      }
    }
  }

  return courses;
}

/**
 * Get a single course by ID
 * @param courseId - The course ID
 * @returns The course or null if not found
 */
export async function getCourseById(
  courseId: string
): Promise<EnhancedTrainingCourse | null> {
  const redis = getRedisClient();
  const data = await redis.get(courseData(courseId));

  if (!data) return null;

  return safeParseJSON<EnhancedTrainingCourse | null>(
    typeof data === 'string' ? data : JSON.stringify(data),
    null
  );
}

// ============================================================================
// ENROLLMENT & COMPLETION FUNCTIONS
// ============================================================================

/**
 * Get all enrolled user IDs for a course
 * @param courseId - The course ID
 * @returns Array of user IDs enrolled in the course
 */
export async function getCourseEnrollments(courseId: string): Promise<string[]> {
  const redis = getRedisClient();
  const userIds = await redis.smembers(courseEnrollments(courseId));
  return userIds || [];
}

/**
 * Get count of enrolled users for a course
 * @param courseId - The course ID
 * @returns Number of enrolled users
 */
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  const redis = getRedisClient();
  const count = await redis.scard(courseEnrollments(courseId));
  return count || 0;
}

/**
 * Get all user IDs who completed a course
 * @param courseId - The course ID
 * @returns Array of user IDs who completed the course
 */
export async function getCourseCompletions(courseId: string): Promise<string[]> {
  const redis = getRedisClient();
  const userIds = await redis.smembers(courseCompletions(courseId));
  return userIds || [];
}

/**
 * Get count of users who completed a course
 * @param courseId - The course ID
 * @returns Number of completions
 */
export async function getCourseCompletionCount(courseId: string): Promise<number> {
  const redis = getRedisClient();
  const count = await redis.scard(courseCompletions(courseId));
  return count || 0;
}

/**
 * Get user's progress for a specific course
 * @param userId - The user ID
 * @param courseId - The course ID
 * @returns The user's progress or null
 */
export async function getUserCourseProgress(
  userId: string,
  courseId: string
): Promise<EnhancedTrainingProgress | null> {
  const redis = getRedisClient();
  const data = await redis.hgetall(userCourseProgress(userId, courseId));

  if (!data || Object.keys(data).length === 0) return null;

  // Reconstruct progress object from hash
  return {
    userId,
    courseId,
    status: (data.status as EnhancedTrainingProgress['status']) || 'not_started',
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
  const redis = getRedisClient();

  // Get counts in parallel
  const [enrolled, completed] = await Promise.all([
    redis.scard(moduleEnrollments(courseId, moduleId)),
    redis.scard(moduleCompletions(courseId, moduleId)),
  ]);

  const enrolledCount = enrolled || 0;
  const completedCount = completed || 0;

  if (enrolledCount === 0) return 0;

  const dropoff = enrolledCount - completedCount;
  return calculatePercentage(dropoff, enrolledCount);
}

/**
 * Get dropoff rates for all modules in a course
 * @param courseId - The course ID
 * @returns Array of module dropoff rates
 */
async function getCourseModuleDropoffRates(
  courseId: string
): Promise<ModuleDropoffRate[]> {
  const course = await getCourseById(courseId);

  if (!course || !course.modules || course.modules.length === 0) {
    return [];
  }

  const redis = getRedisClient();
  const dropoffRates: ModuleDropoffRate[] = [];

  // Fetch all module enrollment and completion counts in parallel
  const pipeline = redis.pipeline();
  for (const module of course.modules) {
    pipeline.scard(moduleEnrollments(courseId, module.id));
    pipeline.scard(moduleCompletions(courseId, module.id));
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
      moduleName: module.title.en || module.title.es || module.title.pt || '',
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

  const redis = getRedisClient();
  const pipeline = redis.pipeline();

  // Fetch counts for each date
  for (const date of dates) {
    pipeline.get(enrollmentByDate(date));
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

  const redis = getRedisClient();
  const pipeline = redis.pipeline();

  // Fetch counts for each date
  for (const date of dates) {
    pipeline.get(completionByDate(date));
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
 * Get enrollment time series using sorted set (alternative to daily keys)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getEnrollmentTimeSeries(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  // First try the daily enrollment keys approach
  const dailyCounts = await getDailyEnrollmentCounts(startDate, endDate);

  // If we have data, return it
  if (dailyCounts.some((d) => d.count > 0)) {
    return dailyCounts;
  }

  // Fallback: use sorted set if available
  const redis = getRedisClient();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime() + 24 * 60 * 60 * 1000 - 1; // End of day

  // Get entries from sorted set within timestamp range
  const entries = await redis.zrangebyscore(
    ENROLLMENT_TIMESERIES,
    startTimestamp,
    endTimestamp
  );

  // Group by date
  const dateMap = new Map<string, number>();
  const dates = getDateRange(startDate, endDate);

  // Initialize all dates with 0
  for (const date of dates) {
    dateMap.set(date, 0);
  }

  // Count entries by date (entries include timestamp information)
  if (entries && Array.isArray(entries)) {
    for (const entry of entries) {
      // Entry format could be "timestamp:userId" or just metadata
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
 * Get completion time series using sorted set (alternative to daily keys)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date and count pairs
 */
export async function getCompletionTimeSeries(
  startDate: string,
  endDate: string
): Promise<TimeSeriesDataPoint[]> {
  // First try the daily completion keys approach
  const dailyCounts = await getDailyCompletionCounts(startDate, endDate);

  // If we have data, return it
  if (dailyCounts.some((d) => d.count > 0)) {
    return dailyCounts;
  }

  // Fallback: use sorted set if available
  const redis = getRedisClient();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime() + 24 * 60 * 60 * 1000 - 1;

  const entries = await redis.zrangebyscore(
    COMPLETION_TIMESERIES,
    startTimestamp,
    endTimestamp
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
 * Get all certifications
 * @returns Array of all certifications
 */
export async function getAllCertifications(): Promise<TrainingCertification[]> {
  const redis = getRedisClient();

  const certIds = await redis.smembers(CERTIFICATIONS_ALL);

  if (!certIds || certIds.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const id of certIds) {
    pipeline.hgetall(certificationData(id));
  }

  const results = await pipeline.exec();
  const certifications: TrainingCertification[] = [];

  for (const result of results) {
    if (result && typeof result === 'object' && Object.keys(result).length > 0) {
      const cert = result as unknown as TrainingCertification;
      // Parse JSON fields if needed
      if (typeof cert.courseName === 'string') {
        cert.courseName = safeParseJSON(cert.courseName, { en: '' });
      }
      certifications.push(cert);
    }
  }

  return certifications;
}

/**
 * Get certification statistics
 * @returns Object with certification stats
 */
export async function getCredentialStats(): Promise<{
  issued: number;
  claimed: number;
  pending: number;
  expired: number;
}> {
  const redis = getRedisClient();

  const [issued, claimed, expired] = await Promise.all([
    redis.scard(certificationsByStatus('issued')),
    redis.scard(certificationsByStatus('claimed')),
    redis.scard(certificationsByStatus('expired')),
  ]);

  // Pending = issued but not claimed
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
  const redis = getRedisClient();

  // Check cache first
  const cached = await redis.get(courseAnalyticsCache(courseId));
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
      pipeline.hgetall(userCourseProgress(userId, courseId));
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
      timeCount > 0
        ? Math.round((totalTimeHours / timeCount) * 10) / 10
        : 0,
    dropoffRates,
  };

  // Cache the results
  await redis.set(
    courseAnalyticsCache(courseId),
    JSON.stringify(analytics),
    { ex: TTL.ANALYTICS_CACHE }
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
  const redis = getRedisClient();

  // Check cache first
  const cached = await redis.get(CREDENTIAL_ANALYTICS_CACHE);
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
  const certifications = await getAllCertifications();

  let totalIssued = certifications.length;
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
  await redis.set(CREDENTIAL_ANALYTICS_CACHE, JSON.stringify(analytics), {
    ex: TTL.CREDENTIAL_CACHE,
  });

  return analytics;
}

/**
 * Calculate average completion rate across all published courses
 * @returns Average completion rate percentage
 */
export async function calculateAverageCompletion(): Promise<number> {
  const publishedCourses = await getEnhancedCoursesByStatus('published');

  if (publishedCourses.length === 0) return 0;

  const redis = getRedisClient();
  const pipeline = redis.pipeline();

  // Get enrollment and completion counts for all courses
  for (const course of publishedCourses) {
    pipeline.scard(courseEnrollments(course.id));
    pipeline.scard(courseCompletions(course.id));
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
  const redis = getRedisClient();

  // Check cache first
  const cached = await redis.get(OVERVIEW_METRICS_CACHE);
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
  const allCourses = await getAllEnhancedCourses();

  const publishedCourses = allCourses.filter((c) => c.status === 'published');
  const draftCourses = allCourses.filter((c) => c.status === 'draft');

  // Get total enrollments across all courses
  let totalEnrollments = 0;
  if (allCourses.length > 0) {
    const pipeline = redis.pipeline();
    for (const course of allCourses) {
      pipeline.scard(courseEnrollments(course.id));
    }
    const enrollmentResults = await pipeline.exec();
    for (const result of enrollmentResults) {
      totalEnrollments += safeParseNumber(result as number);
    }
  }

  // Get average completion rate
  const averageCompletionRate = await calculateAverageCompletion();

  // Get total certifications
  const totalCertifications = await redis.scard(CERTIFICATIONS_ALL);

  const metrics: TrainingOverviewMetrics = {
    totalCourses: allCourses.length,
    publishedCourses: publishedCourses.length,
    draftCourses: draftCourses.length,
    totalEnrollments,
    averageCompletionRate,
    totalCertifications: totalCertifications || 0,
  };

  // Cache the results
  await redis.set(OVERVIEW_METRICS_CACHE, JSON.stringify(metrics), {
    ex: TTL.OVERVIEW_CACHE,
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
  const redis = getRedisClient();
  const today = new Date().toISOString().split('T')[0];

  await Promise.all([
    // Add user to course enrollments
    redis.sadd(courseEnrollments(courseId), userId),
    // Increment daily enrollment count
    redis.incr(enrollmentByDate(today)),
    // Add to time series
    redis.zadd(ENROLLMENT_TIMESERIES, {
      score: Date.now(),
      member: `${Date.now()}:${userId}:${courseId}`,
    }),
  ]);

  // Invalidate cache
  await redis.del(courseAnalyticsCache(courseId));
  await redis.del(OVERVIEW_METRICS_CACHE);
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
  const redis = getRedisClient();
  const today = new Date().toISOString().split('T')[0];

  await Promise.all([
    // Add user to course completions
    redis.sadd(courseCompletions(courseId), userId),
    // Increment daily completion count
    redis.incr(completionByDate(today)),
    // Add to time series
    redis.zadd(COMPLETION_TIMESERIES, {
      score: Date.now(),
      member: `${Date.now()}:${userId}:${courseId}`,
    }),
  ]);

  // Invalidate cache
  await redis.del(courseAnalyticsCache(courseId));
  await redis.del(OVERVIEW_METRICS_CACHE);
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
  const redis = getRedisClient();

  await redis.sadd(moduleEnrollments(courseId, moduleId), userId);

  // Invalidate course analytics cache
  await redis.del(courseAnalyticsCache(courseId));
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
  const redis = getRedisClient();

  await redis.sadd(moduleCompletions(courseId, moduleId), userId);

  // Invalidate course analytics cache
  await redis.del(courseAnalyticsCache(courseId));
}

/**
 * Save or update user's course progress
 * @param progress - The progress data to save
 */
export async function saveUserCourseProgress(
  progress: EnhancedTrainingProgress
): Promise<void> {
  const redis = getRedisClient();
  const key = userCourseProgress(progress.userId, progress.courseId);

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

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Invalidate all analytics caches
 */
export async function invalidateAllCaches(): Promise<void> {
  const redis = getRedisClient();

  // Get all cache keys using scan
  const cachePattern = 'cache:analytics:*';
  let cursor = 0;
  const keysToDelete: string[] = [];

  do {
    const [newCursor, keys] = await redis.scan(cursor, {
      match: cachePattern,
      count: 100,
    });
    cursor = typeof newCursor === 'string' ? parseInt(newCursor) : newCursor;
    keysToDelete.push(...keys);
  } while (cursor !== 0);

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }
}

/**
 * Invalidate cache for a specific course
 * @param courseId - The course ID
 */
export async function invalidateCourseCache(courseId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(courseAnalyticsCache(courseId));
  await redis.del(OVERVIEW_METRICS_CACHE);
}
