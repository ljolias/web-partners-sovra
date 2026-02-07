import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { logger } from '@/lib/logger';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import {
  getTrainingModule,
  updateTrainingProgress,
  getUserTrainingProgress,
  getAllTrainingModules,
  createCertification,
  generateId,
} from '@/lib/redis';
import { logRatingEvent, recalculateAndUpdatePartner } from '@/lib/rating';
import type { TrainingProgress, Certification } from '@/types';

const submitSchema = z.object({
  moduleId: z.string().min(1),
  answers: z.array(z.number()),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user, partner } = await requireSession();

  const body = await request.json();
  const validation = submitSchema.safeParse(body);

  if (!validation.success) {
    const issues = validation.error.issues;
    throw new ValidationError(issues[0]?.message || 'Validation failed');
  }

  const { moduleId, answers } = validation.data;

  const module = await getTrainingModule(moduleId);

  if (!module) {
    throw new NotFoundError('Module');
  }

  if (answers.length !== module.quiz.length) {
    throw new ValidationError('Invalid number of answers');
  }

  // Calculate score
  let correctCount = 0;
  for (let i = 0; i < module.quiz.length; i++) {
    if (answers[i] === module.quiz[i].correctAnswer) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / module.quiz.length) * 100);
  const passed = score >= module.passingScore;

  const progress: TrainingProgress = {
    moduleId,
    userId: user.id,
    completed: passed,
    quizScore: score,
    completedAt: passed ? new Date().toISOString() : null,
    startedAt: new Date().toISOString(),
  };

  await updateTrainingProgress(user.id, progress);

  logger.debug('Quiz submitted', { moduleId, userId: user.id, score, passed });

  // Log training module completion event if passed
  if (passed) {
    await logRatingEvent(
      partner.id,
      user.id,
      'TRAINING_MODULE_COMPLETED',
      { moduleId, score }
    );
  }

  // Check if user completed all modules and grant certification
  if (passed) {
    const allModules = await getAllTrainingModules();
    const userProgress = await getUserTrainingProgress(user.id);
    userProgress[moduleId] = progress;

    const allCompleted = allModules.every(
      (m) => userProgress[m.id]?.completed
    );

    if (allCompleted) {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const certification: Certification = {
        id: generateId(),
        userId: user.id,
        partnerId: partner.id,
        type: 'sales_fundamentals',
        status: 'active',
        issuedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      await createCertification(certification);

      logger.info('Certification granted', { certificationId: certification.id, userId: user.id });

      // Log certification earned event
      await logRatingEvent(
        partner.id,
        user.id,
        'CERTIFICATION_EARNED',
        { certificationId: certification.id, type: certification.type }
      );

      // Recalculate rating after certification
      await recalculateAndUpdatePartner(partner.id, user.id);

      return NextResponse.json({
        passed,
        score,
        progress,
        certification,
      });
    }
  }

  // Recalculate rating if module was passed
  if (passed) {
    recalculateAndUpdatePartner(partner.id, user.id).catch((error) => logger.error('Operation failed', { error }));
  }

  return NextResponse.json({ passed, score, progress });
});
