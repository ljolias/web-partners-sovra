import { NextRequest, NextResponse } from 'next/server';
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
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can access this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const categoryFilter = searchParams.get('category') as CourseCategory | null;

    let courses: TrainingCourse[];

    if (categoryFilter) {
      courses = await getTrainingCoursesByCategory(categoryFilter);
    } else {
      courses = await getAllTrainingCourses();
    }

    return NextResponse.json({ courses });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new training course
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can create courses
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      return NextResponse.json({ error: 'Titulo en espanol requerido' }, { status: 400 });
    }

    if (!description || !description.es) {
      return NextResponse.json({ error: 'Descripcion en espanol requerida' }, { status: 400 });
    }

    if (!['sales', 'technical', 'legal', 'product'].includes(category)) {
      return NextResponse.json({ error: 'Categoria invalida' }, { status: 400 });
    }

    if (!['basic', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json({ error: 'Nivel invalido' }, { status: 400 });
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

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
