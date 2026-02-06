'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { VideoModuleEditor } from './VideoModuleEditor';
import { ReadingModuleEditor } from './ReadingModuleEditor';
import { QuizModuleEditor } from './QuizModuleEditor';
import { DownloadModuleEditor } from './DownloadModuleEditor';
import type { EnhancedCourseModule } from '@/types';

interface ModuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (module: EnhancedCourseModule) => void;
  module: EnhancedCourseModule;
}

export function ModuleEditorModal({
  isOpen,
  onClose,
  onSave,
  module,
}: ModuleEditorModalProps) {
  const [currentModule, setCurrentModule] = useState<EnhancedCourseModule>(module);

  useEffect(() => {
    setCurrentModule(module);
  }, [module]);

  if (!isOpen) return null;

  const handleModuleChange = (updatedModule: EnhancedCourseModule) => {
    setCurrentModule(updatedModule);
  };

  const handleSave = () => {
    onSave(currentModule);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Editar Módulo
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {module.type === 'video' && 'Configura el contenido de video'}
                {module.type === 'reading' && 'Configura el contenido de lectura'}
                {module.type === 'quiz' && 'Configura las preguntas del quiz'}
                {module.type === 'download' && 'Configura los archivos descargables'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {currentModule.type === 'video' && (
              <VideoModuleEditor
                module={currentModule}
                onChange={handleModuleChange}
                onSave={handleSave}
              />
            )}
            {currentModule.type === 'reading' && (
              <ReadingModuleEditor
                module={currentModule}
                onChange={handleModuleChange}
                onSave={handleSave}
              />
            )}
            {currentModule.type === 'quiz' && (
              <QuizModuleEditor
                module={currentModule}
                onChange={handleModuleChange}
                onSave={handleSave}
              />
            )}
            {currentModule.type === 'download' && (
              <DownloadModuleEditor
                module={currentModule}
                onChange={handleModuleChange}
                onSave={handleSave}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
