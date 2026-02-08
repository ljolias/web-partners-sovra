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
import { courseCreateSchema, validateInput } from '@/lib/validation/schemas';
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

  // Validate input with Zod
  const validation = await validateInput(courseCreateSchema, {
    title: body.title,
    description: body.description,
    category: body.category,
    difficulty: body.level, // Map 'level' to 'difficulty' for schema
    estimatedDuration: body.duration || 30,
    published: body.isPublished || false,
  });

  if (!validation.success) {
    throw new ValidationError('Validation failed', validation.errors);
  }

  const {
    title,
    description,
    category,
    difficulty: level,
    estimatedDuration: duration,
  } = validation.data;

  // Additional fields not in schema
  const passingScore = body.passingScore || 70;
  const isRequired = body.isRequired || false;
  const requiredForTiers = (body.requiredForTiers || []) as PartnerTier[];
  const certificateEnabled = body.certificateEnabled !== false;

  // Get existing courses to determine order
  const existingCourses = await getAllTrainingCourses();
  const maxOrder = existingCourses.reduce((max, c) => Math.max(max, c.order), 0);

  // Create course
  const now = new Date().toISOString();
  const course: TrainingCourse = {
    id: generateId(),
    title: {
      es: title.es,
      en: title.en,
      pt: '', // Portuguese not yet supported in schema
    },
    description: {
      es: description.es,
      en: description.en,
      pt: '', // Portuguese not yet supported in schema
    },
    category: category as CourseCategory,
    level: level as CourseLevel,
    duration: duration,
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
