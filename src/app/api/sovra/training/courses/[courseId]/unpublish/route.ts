import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import {
  getTrainingCourse,
  unpublishTrainingCourse,
  addAuditLog,
} from '@/lib/redis';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// POST - Unpublish course
export const POST = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { user } = await requireSession();
  const { courseId } = await params;

  // Only Sovra Admin can unpublish courses
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can unpublish courses');
  }

  const course = await getTrainingCourse(courseId);
  if (!course) {
    throw new NotFoundError('Curso');
  }

  if (!course.isPublished) {
    throw new ValidationError('El curso ya esta despublicado');
  }

  await unpublishTrainingCourse(courseId);

  // Add audit log
  await addAuditLog(
    'course.updated',
    'course',
    courseId,
    { id: user.id, name: user.name, type: 'sovra_admin' },
    { entityName: course.title.es, metadata: { action: 'unpublished' } }
  );

  const updatedCourse = await getTrainingCourse(courseId);

  logger.info('Course unpublished', { courseId, title: course.title.es });

  return NextResponse.json({
    course: updatedCourse,
    message: 'Curso despublicado exitosamente',
  });
});
