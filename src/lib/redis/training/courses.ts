/**
 * Training System Course Analytics
 * Functions for detailed course analytics and overview metrics
 */

import { redis } from '../client';
import {
  getAllTrainingCourses,
  getPublishedTrainingCourses,
} from '../operations';
import { trainingKeys, CACHE_TTL } from './keys';
import { calculatePercentage, safeParseJSON, safeParseNumber } from './helpers';
import { getCourseEnrollments, getCourseEnrollmentCount, getCourseCompletionCount } from './enrollments';
import { getCourseModuleDropoffRates } from './analytics';
import type { CourseDetailedAnalytics, TrainingOverviewMetrics } from './types';

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
