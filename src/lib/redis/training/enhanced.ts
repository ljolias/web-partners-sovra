/**
 * Training System Enhanced Course Functions
 * Functions for mapping legacy courses to enhanced course format
 */

import {
  getAllTrainingCourses,
} from '../operations';
import { getLocalizedName } from './helpers';
import type {
  EnhancedTrainingCourse,
  CourseStatus,
} from '@/types';

/**
 * Get all enhanced courses
 * Maps existing TrainingCourse to EnhancedTrainingCourse format
 */
export async function getAllEnhancedCourses(): Promise<EnhancedTrainingCourse[]> {
  const courses = await getAllTrainingCourses();

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: mapCategoryToEnhanced(course.category),
    level: mapLevelToDifficulty(course.level),
    estimatedHours: Math.ceil(course.duration / 60),
    modules: course.modules.map((m) => {
      // Get first lesson's type if it exists, otherwise 'quiz' if module has quiz
      let type: 'video' | 'reading' | 'quiz' | 'download' = 'reading';
      let videoUrl: string | undefined;
      let content: { en: string } | undefined;

      if (m.lessons && m.lessons.length > 0) {
        const firstLesson = m.lessons[0];
        type = firstLesson.type === 'video' ? 'video' : firstLesson.type === 'download' ? 'download' : 'reading';
        videoUrl = firstLesson.videoUrl;
        if (firstLesson.content) {
          content = { en: typeof firstLesson.content === 'string' ? firstLesson.content : firstLesson.content.en || '' };
        }
      } else if (m.quiz && m.quiz.length > 0) {
        type = 'quiz';
      }

      return {
        id: m.id,
        title: m.title,
        type,
        duration: m.duration || 30,
        order: m.order,
        videoUrl,
        content,
        questions: m.quiz?.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
        passingScore: m.passingScore || course.passingScore,
      };
    }),
    hasCertification: course.certificateEnabled,
    certification: course.certificateEnabled
      ? {
          credentialName: getLocalizedName(course.title),
        }
      : undefined,
    passingScore: course.passingScore,
    status: course.isPublished ? 'published' : 'draft',
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    createdBy: course.createdBy,
  }));
}

/**
 * Get enhanced courses by status
 */
export async function getEnhancedCoursesByStatus(
  status: CourseStatus
): Promise<EnhancedTrainingCourse[]> {
  const allCourses = await getAllEnhancedCourses();
  return allCourses.filter((c) => c.status === status);
}

// Helper functions for mapping types
function mapCategoryToEnhanced(
  category: 'sales' | 'technical' | 'legal' | 'product'
): 'sales' | 'technical' | 'legal' | 'product' {
  return category;
}

function mapLevelToDifficulty(
  level: 'basic' | 'intermediate' | 'advanced'
): 'basic' | 'intermediate' | 'advanced' {
  return level;
}

function mapModuleType(
  type: 'video' | 'document' | 'quiz'
): 'video' | 'reading' | 'quiz' | 'download' {
  if (type === 'document') return 'reading';
  return type;
}
