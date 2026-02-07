import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ForbiddenError, ValidationError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import {
  getAllTrainingCourses,
  getTrainingCoursesByCategory,
  createTrainingCourse,
  generateId,
  addAuditLog,
} from '@/lib/redis';
import type { TrainingCourse, CourseCategory, CourseLevel, PartnerTier } from '@/types';

// GET - List all training courses
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { user } = await requireSession();

  // Only Sovra Admin can access this
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can access courses');
  }

  const searchParams = request.nextUrl.searchParams;
  const categoryFilter = searchParams.get('category') as CourseCategory | null;

  let courses: TrainingCourse[];

  if (categoryFilter) {
    courses = await getTrainingCoursesByCategory(categoryFilter);
  } else {
    courses = await getAllTrainingCourses();
  }

  logger.debug('Courses retrieved', { count: courses.length, category: categoryFilter });

  return NextResponse.json({ courses });
});

// POST - Create new training course
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user } = await requireSession();

  // Only Sovra Admin can create courses
  if (user.role !== 'sovra_admin') {
    throw new ForbiddenError('Only Sovra Admin can create courses');
  }

  const body = await request.json();
  const {
    title,
    description,
    category,
    level,
    duration,
    passingScore,
    isRequired,
    requiredForTiers,
    certificateEnabled,
  } = body;

  // Validation
  if (!title || !title.es) {
    throw new ValidationError('Titulo en espanol requerido');
  }

  if (!description || !description.es) {
    throw new ValidationError('Descripcion en espanol requerida');
  }

  if (!['sales', 'technical', 'legal', 'product'].includes(category)) {
    throw new ValidationError('Categoria invalida');
  }

  if (!['basic', 'intermediate', 'advanced'].includes(level)) {
    throw new ValidationError('Nivel invalido');
  }

  // Get existing courses to determine order
  const existingCourses = await getAllTrainingCourses();
  const maxOrder = existingCourses.reduce((max, c) => Math.max(max, c.order), 0);

  // Create course
  const now = new Date().toISOString();
  const course: TrainingCourse = {
    id: generateId(),
    title: {
      es: title.es,
      en: title.en || '',
      pt: title.pt || '',
    },
    description: {
      es: description.es,
      en: description.en || '',
      pt: description.pt || '',
    },
    category: category as CourseCategory,
    level: level as CourseLevel,
    duration: duration || 30,
    modules: [],
    isPublished: false,
    isRequired: isRequired || false,
    requiredForTiers: (requiredForTiers || []) as PartnerTier[],
    passingScore: passingScore || 70,
    certificateEnabled: certificateEnabled !== false,
    order: maxOrder + 1,
    createdAt: now,
    createdBy: user.id,
    updatedAt: now,
  };

  await createTrainingCourse(course);

  // Add audit log
  await addAuditLog(
    'course.created',
    'course',
    course.id,
    { id: user.id, name: user.name, type: 'sovra_admin' },
    { entityName: title.es }
  );

  logger.info('Course created', { courseId: course.id, title: title.es });

  return NextResponse.json({ course }, { status: 201 });
});
