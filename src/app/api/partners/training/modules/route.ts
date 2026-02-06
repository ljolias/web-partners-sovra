import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAllTrainingModules, getPublishedTrainingCourses } from '@/lib/redis';
import type { TrainingModule } from '@/types';

export async function GET() {
  try {
    await requireSession();

    // Get legacy training modules (for backward compatibility)
    const legacyModules = await getAllTrainingModules();

    // Get published courses from admin (new system)
    const publishedCourses = await getPublishedTrainingCourses();

    // Convert published courses to module format for the frontend
    const coursesAsModules: TrainingModule[] = [];

    for (const course of publishedCourses) {
      // Create a module for each module in the course
      for (const courseModule of course.modules) {
        // Handle quiz modules specially
        if (courseModule.type === 'quiz' && courseModule.quiz) {
          const quizQuestions = courseModule.quiz.map((q, idx) => {
            const convertedOptions: Record<string, string[]> = {};
            const locales = ['en', 'es', 'pt'];

            for (const locale of locales) {
              convertedOptions[locale] = q.options.map((opt) => opt[locale] || opt.en || '');
            }

            return {
              id: `q${idx}`,
              question: q.question,
              options: convertedOptions,
              correctAnswer: q.correctAnswer,
            };
          });

          coursesAsModules.push({
            id: courseModule.id,
            title: courseModule.title,
            description: courseModule.title, // Use title as description
            content: courseModule.title,
            duration: courseModule.duration || 30,
            order: 0,
            quiz: quizQuestions,
            passingScore: course.passingScore || 70,
            createdAt: course.createdAt,
          } as any);
        } else {
          // Non-quiz modules (video, reading, download)
          const moduleContent = courseModule.type === 'video' && courseModule.videoUrl
            ? courseModule.videoUrl
            : courseModule.documentUrl || courseModule.title;

          coursesAsModules.push({
            id: courseModule.id,
            title: courseModule.title,
            description: courseModule.title,
            content: moduleContent,
            duration: courseModule.duration || 30,
            order: 0,
            quiz: [],
            passingScore: 0,
            createdAt: course.createdAt,
            videoUrl: courseModule.videoUrl,
          } as any);
        }
      }
    }

    // Combine legacy modules and courses (courses take priority by ID)
    const legacyIds = new Set(legacyModules.map((m) => m.id));
    const combinedModules = [
      ...coursesAsModules.filter((c) => !legacyIds.has(c.id)),
      ...legacyModules,
    ].sort((a, b) => a.order - b.order);

    return NextResponse.json({ modules: combinedModules });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get modules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
