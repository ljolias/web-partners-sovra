import { NextRequest, NextResponse } from 'next/server';
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
import type { TrainingProgress, Certification } from '@/types';

const submitSchema = z.object({
  moduleId: z.string().min(1),
  answers: z.array(z.number()),
});

export async function POST(request: NextRequest) {
  try {
    const { user, partner } = await requireSession();

    const body = await request.json();
    const validation = submitSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { moduleId, answers } = validation.data;

    const module = await getTrainingModule(moduleId);

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (answers.length !== module.quiz.length) {
      return NextResponse.json(
        { error: 'Invalid number of answers' },
        { status: 400 }
      );
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

        return NextResponse.json({
          passed,
          score,
          progress,
          certification,
        });
      }
    }

    return NextResponse.json({ passed, score, progress });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Submit quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
