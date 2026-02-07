import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getUserTrainingProgress } from '@/lib/redis';

export const GET = withErrorHandling(async () => {
  const { user } = await requireSession();
  const progress = await getUserTrainingProgress(user.id);

  logger.debug('Training progress retrieved', { userId: user.id });

  return NextResponse.json({ progress });
});
