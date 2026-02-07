import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import {
  getTrainingCourse,
  publishTrainingCourse,
  addAuditLog,
} from '@/lib/redis';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// POST - Publish course
export const POST = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { user } = await requireSession();
  const { courseId } = await params;

  // Only Sovra Admin can publish courses
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can publish courses');
  }

  const course = await getTrainingCourse(courseId);
  if (!course) {
    throw new NotFoundError('Curso');
  }

  if (course.isPublished) {
    throw new ValidationError('El curso ya esta publicado');
  }

  await publishTrainingCourse(courseId);

  // Add audit log
  await addAuditLog(
    'course.published',
    'course',
    courseId,
    { id: user.id, name: user.name, type: 'sovra_admin' },
    { entityName: course.title.es }
  );

  const updatedCourse = await getTrainingCourse(courseId);

  logger.info('Course published', { courseId, title: course.title.es });

  return NextResponse.json({
    course: updatedCourse,
    message: 'Curso publicado exitosamente',
  });
});
