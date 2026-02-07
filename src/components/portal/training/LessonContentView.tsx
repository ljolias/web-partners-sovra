'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui';
import { sanitizeHtml } from '@/lib/security/sanitize';

interface LessonContentViewProps {
  lesson: any;
  module: any;
  locale: string;
  onCompleted: () => void;
  onShowQuiz: () => void;
  onBack: () => void;
}

export function LessonContentView({
  lesson,
  module,
  locale,
  onCompleted,
  onShowQuiz,
  onBack,
}: LessonContentViewProps) {
  const [watched, setWatched] = useState(false);

  const lessonTitle = lesson.title?.[locale] || lesson.title?.en || lesson.title;
  const lessonContent = lesson.content?.[locale] || lesson.content?.en;

  // Check if this is a video lesson
  const isVideo = lesson.type === 'video';
  const videoUrl = lesson.videoUrl;

  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

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
      {/* Lesson Header */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
        >
          ← Volver al módulo
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{lessonTitle}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {lesson.duration} minutos
          </span>
          <span>
            {lesson.type === 'video' ? '🎥 Video' : lesson.type === 'reading' ? '📖 Lectura' : '📥 Descarga'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-lg p-8">
        {isVideo && videoUrl ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contenido de Video</h3>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(videoUrl)}
                title={lessonTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {lesson.type === 'reading' ? 'Material de Lectura' : 'Descarga'}
            </h3>
            <div className="max-w-2xl mx-auto text-left bg-white p-6 rounded-lg">
              {lessonContent ? (
                <div className="prose prose-sm max-w-none">
                  {/* Check if content is HTML or Markdown */}
                  {lessonContent.includes('<') && lessonContent.includes('>') ? (
                    // HTML content - sanitize it
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(lessonContent) }} />
                  ) : (
                    // Markdown content - render safely
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {lessonContent}
                    </ReactMarkdown>
                  )}
                </div>
              ) : lesson.downloadUrl ? (
                <a
                  href={lesson.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Download className="h-5 w-5" />
                  Descargar archivo
                </a>
              ) : (
                <p className="text-gray-500">No hay contenido disponible</p>
              )}
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
              Contenido visto
            </span>
          ) : (
            <span>Marca como completado para continuar</span>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {watched ? 'Completado' : 'Marcar como Completado'}
          </Button>

          {watched && module.quiz && module.quiz.length > 0 && (
            <Button
              onClick={onShowQuiz}
              variant="outline"
            >
              Ir al Quiz
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
