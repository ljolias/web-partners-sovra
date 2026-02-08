import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { withRateLimit, RATE_LIMITS } from '@/lib/api/withRateLimit';
import { logger } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';
import { requireSession } from '@/lib/auth';
import { getTrainingModule, updateTrainingProgress, getTrainingCourse } from '@/lib/redis';
import type { TrainingProgress } from '@/types';

export const POST = withRateLimit(
  withErrorHandling(async (
    _request: NextRequest,
    { params }: { params: Promise<{ moduleId: string }> }
  ) => {
    const { user } = await requireSession();
  const { moduleId } = await params;

  // Try to get as a legacy module first
  let module = await getTrainingModule(moduleId);

  // If not found, try to get as a course (new system)
  if (!module) {
    const course = await getTrainingCourse(moduleId);
    if (!course) {
      throw new NotFoundError('Module');
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

  logger.debug('Module started', { moduleId, userId: user.id });

  return NextResponse.json({ progress });
  }),
  RATE_LIMITS.CREATE
);
