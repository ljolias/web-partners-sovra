import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import {
  getTrainingCourse,
  updateTrainingCourse,
  deleteTrainingCourse,
  addAuditLog,
} from '@/lib/redis';
import type { CourseCategory, CourseLevel, PartnerTier } from '@/types';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// GET - Get course detail
export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { user } = await requireSession();
  const { courseId } = await params;

  // Only Sovra Admin can access this
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can access courses');
  }

  const course = await getTrainingCourse(courseId);
  if (!course) {
    throw new NotFoundError('Curso');
  }

  logger.debug('Course retrieved', { courseId });

  return NextResponse.json({ course });
});

// PUT - Update course
export const PUT = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { user } = await requireSession();
  const { courseId } = await params;

  // Only Sovra Admin can update courses
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can update courses');
  }

  const course = await getTrainingCourse(courseId);
  if (!course) {
    throw new NotFoundError('Curso');
  }

  const body = await request.json();
  const {
    title,
    description,
    category,
    level,
    duration,
    modules,
    passingScore,
    isRequired,
    requiredForTiers,
    certificateEnabled,
    order,
  } = body;

  // Build updates
  const updates: Record<string, unknown> = {};

  if (title) updates.title = title;
  if (description) updates.description = description;
  if (category && ['sales', 'technical', 'legal', 'product'].includes(category)) {
    updates.category = category as CourseCategory;
  }
  if (level && ['basic', 'intermediate', 'advanced'].includes(level)) {
    updates.level = level as CourseLevel;
  }
  if (duration !== undefined) updates.duration = duration;
  if (modules !== undefined) updates.modules = modules;
  if (passingScore !== undefined) updates.passingScore = passingScore;
  if (isRequired !== undefined) updates.isRequired = isRequired;
  if (requiredForTiers !== undefined) updates.requiredForTiers = requiredForTiers as PartnerTier[];
  if (certificateEnabled !== undefined) updates.certificateEnabled = certificateEnabled;
  if (order !== undefined) updates.order = order;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ course, message: 'No hay cambios' });
  }

  await updateTrainingCourse(courseId, updates);

  // Add audit log
  await addAuditLog(
    'course.updated',
    'course',
    courseId,
    { id: user.id, name: user.name, type: 'sovra_admin' },
    { entityName: course.title.es }
  );

  const updatedCourse = await getTrainingCourse(courseId);

  logger.info('Course updated', { courseId, updatedFields: Object.keys(updates) });

  return NextResponse.json({ course: updatedCourse });
});

// DELETE - Delete course
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { user } = await requireSession();
  const { courseId } = await params;

  // Only Sovra Admin can delete courses
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can delete courses');
  }

  const course = await getTrainingCourse(courseId);
  if (!course) {
    throw new NotFoundError('Curso');
  }

  await deleteTrainingCourse(courseId);

  // Add audit log (using course.updated as we don't have a delete action type)
  await addAuditLog(
    'course.updated',
    'course',
    courseId,
    { id: user.id, name: user.name, type: 'sovra_admin' },
    { entityName: course.title.es, metadata: { action: 'deleted' } }
  );

  logger.info('Course deleted', { courseId, title: course.title.es });

  return NextResponse.json({ message: 'Curso eliminado exitosamente' });
});
