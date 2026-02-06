import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getTrainingModule, updateTrainingProgress, getTrainingCourse } from '@/lib/redis';
import type { TrainingProgress } from '@/types';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { user } = await requireSession();
    const { moduleId } = await params;

    // Try to get as a legacy module first
    let module = await getTrainingModule(moduleId);

    // If not found, try to get as a course (new system)
    if (!module) {
      const course = await getTrainingCourse(moduleId);
      if (!course) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 });
      }
      // If it's a course, we can still track progress with the same structure
    }

    const progress: TrainingProgress = {
      moduleId,
      userId: user.id,
      completed: false,
      quizScore: null,
      completedAt: null,
      startedAt: new Date().toISOString(),
    };

    await updateTrainingProgress(user.id, progress);

    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Start module error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
