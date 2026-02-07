/**
 * Training System Dropoff Analytics
 * Functions for calculating module and course dropoff rates
 */

import { redis } from '../client';
import { getTrainingCourse } from '../operations';
import { trainingKeys } from './keys';
import { calculatePercentage, getLocalizedName, safeParseNumber } from './helpers';
import type { ModuleDropoffRate } from './types';

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
export async function getCourseModuleDropoffRates(
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
