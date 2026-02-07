/**
 * Training System Enrollment Operations
 * Functions for managing and querying course enrollments and user progress
 */

import { redis } from '../client';
import { trainingKeys, CACHE_TTL } from './keys';
import { safeParseNumber, safeParseJSON } from './helpers';
import type { EnhancedTrainingProgress } from './types';

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
