import React from 'react';
import { motion } from 'framer-motion';
import { LessonContentView } from './LessonContentView';
import type { Lesson, CourseModule } from '@/types';

interface LessonModalProps {
  lesson: Lesson;
  module: CourseModule;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
  onShowQuiz: () => void;
}

export const LessonModal = React.memo(function LessonModal({
  lesson,
  module,
  locale,
  isOpen,
  onClose,
  onCompleted,
  onShowQuiz,
}: LessonModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <LessonContentView
            lesson={lesson}
            module={module}
            locale={locale}
            onCompleted={onCompleted}
            onShowQuiz={onShowQuiz}
            onBack={onClose}
          />
        </div>
      </motion.div>
    </motion.div>
  );
});
