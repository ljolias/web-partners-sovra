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
    const coursesAsModules: TrainingModule[] = publishedCourses.map((course) => {
      // Convert CourseQuizQuestion[] to QuizQuestion[]
      // CourseQuizQuestion.options is LocalizedString[] (array of {en, es, pt})
      // QuizQuestion.options is Record<string, string[]> ({en: [], es: [], pt: []})
      const quizQuestions = course.modules
        .filter((m) => m.type === 'quiz' && m.quiz)
        .flatMap((m) => m.quiz || [])
        .map((q, idx) => {
          // Convert options from LocalizedString[] to Record<string, string[]>
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

      // Calculate total duration from modules
      const totalDuration = course.modules.reduce((sum, m) => sum + (m.duration || 0), 0);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        content: course.description, // Use description as content for now
        duration: totalDuration || course.estimatedHours * 60 || 30,
        order: course.order || 0,
        quiz: quizQuestions,
        passingScore: course.passingScore || 70,
        createdAt: course.createdAt || new Date().toISOString(),
      };
    });

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
