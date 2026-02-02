import { NextRequest, NextResponse } from 'next/server';
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
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { courseId } = await params;

    // Only Sovra Admin can access this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const course = await getTrainingCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update course
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { courseId } = await params;

    // Only Sovra Admin can update courses
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const course = await getTrainingCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
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

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { courseId } = await params;

    // Only Sovra Admin can delete courses
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const course = await getTrainingCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
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

    return NextResponse.json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
