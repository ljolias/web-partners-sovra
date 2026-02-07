import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getPublishedTrainingCourses } from '@/lib/redis';
import type { TrainingCourse } from '@/types';

export const GET = withErrorHandling(async () => {
  await requireSession();

  // Get published courses with full Course → Module → Lesson hierarchy
  const publishedCourses = await getPublishedTrainingCourses();

  logger.debug('Published courses retrieved', { count: publishedCourses.length });

  // Return courses with their complete structure
  // Each course contains modules, each module contains lessons
  return NextResponse.json({
    courses: publishedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      modules: course.modules.map((module: any) => {
        // Handle both new structure (with lessons) and old structure (without lessons)
        const hasLessons = module.lessons && Array.isArray(module.lessons) && module.lessons.length > 0;

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          order: module.order,
          duration: module.duration,
          // New structure: lessons array
          lessons: hasLessons
            ? module.lessons.map((lesson: any) => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type,
                duration: lesson.duration,
                order: lesson.order,
                videoUrl: lesson.videoUrl,
                content: lesson.content,
                downloadUrl: lesson.downloadUrl,
              }))
            : // Old structure: convert module properties to a single lesson
              [
                {
                  id: module.id,
                  title: module.title,
                  type: (module as any).type || 'reading',
                  duration: module.duration || 30,
                  order: 0,
                  videoUrl: (module as any).videoUrl,
                  content: (module as any).content || (module as any).documentUrl,
                  downloadUrl: (module as any).downloadUrl,
                },
              ],
          quiz: module.quiz,
          passingScore: module.passingScore,
        };
      }),
      passingScore: course.passingScore,
      certificateEnabled: course.certificateEnabled,
      isRequired: course.isRequired,
      createdAt: course.createdAt,
      createdBy: course.createdBy,
    })),
  });
});
