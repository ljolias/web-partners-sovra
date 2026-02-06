'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import type { TrainingModule } from '@/types';

interface ModuleContentViewProps {
  module: TrainingModule;
  locale: string;
  onCompleted: () => void;
  onTakeQuiz: () => void;
}

export function ModuleContentView({
  module,
  locale,
  onCompleted,
  onTakeQuiz,
}: ModuleContentViewProps) {
  const [watched, setWatched] = useState(false);

  const moduleTitle = (module.title?.[locale as keyof typeof module.title] || module.title?.en) as string;
  const moduleDescription = (module.description?.[locale as keyof typeof module.description] || module.description?.en) as string;
  const moduleContent = (module.content?.[locale as keyof typeof module.content] || module.content?.en) as string;

  // Determine module type from ID or content
  const isVideo = moduleContent?.includes('youtube') || moduleContent?.includes('watch?v=');
  const isDocument = !isVideo;

  const handleComplete = () => {
    setWatched(true);
    onCompleted();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Module Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{moduleTitle}</h2>
        <p className="text-gray-600">{moduleDescription}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {module.duration} minutes
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        {isVideo ? (
          <div className="space-y-4">
            <Play className="h-16 w-16 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Video Content</h3>
            <p className="text-gray-600 max-w-md mx-auto">{moduleContent}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <FileText className="h-16 w-16 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Reading Material</h3>
            <div className="max-w-2xl mx-auto text-left bg-white p-6 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: moduleContent }} />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {watched ? (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Content viewed
            </span>
          ) : (
            <span>Mark as complete to continue</span>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {watched ? 'Completed' : 'Mark as Complete'}
          </Button>

          {watched && module.quiz && module.quiz.length > 0 && (
            <Button
              onClick={onTakeQuiz}
              variant="outline"
            >
              Take Quiz
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
