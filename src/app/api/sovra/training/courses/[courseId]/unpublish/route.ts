import { NextRequest, NextResponse } from 'next/server';
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
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { courseId } = await params;

    // Only Sovra Admin can unpublish courses
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const course = await getTrainingCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (!course.isPublished) {
      return NextResponse.json({ error: 'El curso ya esta despublicado' }, { status: 400 });
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

    return NextResponse.json({
      course: updatedCourse,
      message: 'Curso despublicado exitosamente',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Unpublish course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
