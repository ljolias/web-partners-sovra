import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getTrainingModule, updateTrainingProgress } from '@/lib/redis';
import type { TrainingProgress } from '@/types';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { user } = await requireSession();
    const { moduleId } = await params;

    const module = await getTrainingModule(moduleId);

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
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
