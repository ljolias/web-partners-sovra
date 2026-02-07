import { redis } from '../client';
import { keys } from '../keys';
import type { TrainingCourse } from '@/types';
import { toRedisHash } from './helpers';

export async function getTrainingCourse(id: string): Promise<TrainingCourse | null> {
  const course = await redis.hgetall(keys.trainingCourse(id)) as TrainingCourse | null;
  if (!course || !course.id) return null;
  // Parse JSON fields
  if (typeof course.title === 'string') course.title = JSON.parse(course.title);
  if (typeof course.description === 'string') course.description = JSON.parse(course.description);
  if (typeof course.modules === 'string') course.modules = JSON.parse(course.modules);
  if (typeof course.requiredForTiers === 'string' && course.requiredForTiers) {
    course.requiredForTiers = JSON.parse(course.requiredForTiers as unknown as string);
  }
  // Parse booleans
  if (typeof course.isPublished === 'string') course.isPublished = course.isPublished === 'true';
  if (typeof course.isRequired === 'string') course.isRequired = course.isRequired === 'true';
  if (typeof course.certificateEnabled === 'string') course.certificateEnabled = course.certificateEnabled === 'true';
  // Parse numbers
  if (typeof course.duration === 'string') course.duration = parseInt(course.duration, 10);
  if (typeof course.passingScore === 'string') course.passingScore = parseInt(course.passingScore, 10);
  if (typeof course.order === 'string') course.order = parseInt(course.order, 10);
  return course;
}

export async function getAllTrainingCourses(): Promise<TrainingCourse[]> {
  const courseIds = await redis.zrange<string[]>(keys.allTrainingCourses(), 0, -1, { rev: true });
  if (!courseIds.length) return [];
  const courses = await Promise.all(courseIds.map((id) => getTrainingCourse(id)));
  return courses.filter((c): c is TrainingCourse => c !== null).sort((a, b) => a.order - b.order);
}

export async function getPublishedTrainingCourses(): Promise<TrainingCourse[]> {
  const courseIds = await redis.smembers<string[]>(keys.publishedTrainingCourses());
  if (!courseIds.length) return [];
  const courses = await Promise.all(courseIds.map((id) => getTrainingCourse(id)));
  return courses.filter((c): c is TrainingCourse => c !== null).sort((a, b) => a.order - b.order);
}

export async function getTrainingCoursesByCategory(category: string): Promise<TrainingCourse[]> {
  const courseIds = await redis.smembers<string[]>(keys.trainingCoursesByCategory(category));
  if (!courseIds.length) return [];
  const courses = await Promise.all(courseIds.map((id) => getTrainingCourse(id)));
  return courses.filter((c): c is TrainingCourse => c !== null).sort((a, b) => a.order - b.order);
}

export async function createTrainingCourse(course: TrainingCourse): Promise<void> {
  const pipeline = redis.pipeline();

  const courseData = {
    ...course,
    title: JSON.stringify(course.title),
    description: JSON.stringify(course.description),
    modules: JSON.stringify(course.modules),
    requiredForTiers: course.requiredForTiers ? JSON.stringify(course.requiredForTiers) : '',
  };

  pipeline.hset(keys.trainingCourse(course.id), toRedisHash(courseData));

  // Add to all courses sorted by order
  pipeline.zadd(keys.allTrainingCourses(), {
    score: course.order,
    member: course.id,
  });

  // Add to category index
  pipeline.sadd(keys.trainingCoursesByCategory(course.category), course.id);

  // Add to published index if published
  if (course.isPublished) {
    pipeline.sadd(keys.publishedTrainingCourses(), course.id);
  }

  await pipeline.exec();
}

export async function updateTrainingCourse(id: string, updates: Partial<TrainingCourse>): Promise<void> {
  const course = await getTrainingCourse(id);
  if (!course) throw new Error('Course not found');

  const pipeline = redis.pipeline();

  const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.title) updateData.title = JSON.stringify(updates.title);
  if (updates.description) updateData.description = JSON.stringify(updates.description);
  if (updates.modules) updateData.modules = JSON.stringify(updates.modules);
  if (updates.requiredForTiers) updateData.requiredForTiers = JSON.stringify(updates.requiredForTiers);

  pipeline.hset(keys.trainingCourse(id), toRedisHash(updateData as Record<string, unknown>));

  // Update category index if changed
  if (updates.category && updates.category !== course.category) {
    pipeline.srem(keys.trainingCoursesByCategory(course.category), id);
    pipeline.sadd(keys.trainingCoursesByCategory(updates.category), id);
  }

  // Update published index if changed
  if (updates.isPublished !== undefined && updates.isPublished !== course.isPublished) {
    if (updates.isPublished) {
      pipeline.sadd(keys.publishedTrainingCourses(), id);
    } else {
      pipeline.srem(keys.publishedTrainingCourses(), id);
    }
  }

  // Update order in sorted set if changed
  if (updates.order !== undefined && updates.order !== course.order) {
    pipeline.zadd(keys.allTrainingCourses(), {
      score: updates.order,
      member: id,
    });
  }

  await pipeline.exec();
}

export async function deleteTrainingCourse(id: string): Promise<void> {
  const course = await getTrainingCourse(id);
  if (!course) throw new Error('Course not found');

  const pipeline = redis.pipeline();

  pipeline.del(keys.trainingCourse(id));
  pipeline.zrem(keys.allTrainingCourses(), id);
  pipeline.srem(keys.trainingCoursesByCategory(course.category), id);
  if (course.isPublished) {
    pipeline.srem(keys.publishedTrainingCourses(), id);
  }

  await pipeline.exec();
}

export async function publishTrainingCourse(id: string): Promise<void> {
  await updateTrainingCourse(id, { isPublished: true });
}

export async function unpublishTrainingCourse(id: string): Promise<void> {
  await updateTrainingCourse(id, { isPublished: false });
}
