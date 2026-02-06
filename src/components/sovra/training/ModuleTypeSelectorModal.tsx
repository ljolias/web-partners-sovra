'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, HelpCircle, Download, X } from 'lucide-react';
import type { ModuleType } from '@/types';

interface ModuleTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ModuleType) => void;
}

interface ModuleOption {
  type: ModuleType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODULE_OPTIONS: ModuleOption[] = [
  {
    type: 'video',
    label: 'Video',
    description: 'Integra videos de YouTube con control de visualización',
    icon: <Play className="w-6 h-6" />,
  },
  {
    type: 'reading',
    label: 'Lectura',
    description: 'Contenido enriquecido con archivos adjuntos',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    type: 'quiz',
    label: 'Quiz',
    description: 'Evaluaciones con múltiples tipos de preguntas',
    icon: <HelpCircle className="w-6 h-6" />,
  },
  {
    type: 'download',
    label: 'Descarga',
    description: 'Archivos para descargar',
    icon: <Download className="w-6 h-6" />,
  },
];

export function ModuleTypeSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: ModuleTypeSelectorModalProps) {
  if (!isOpen) return null;

  const handleSelect = (type: ModuleType) => {
    onSelect(type);
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
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-2xl border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                Selecciona el tipo de módulo
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Elige el tipo de contenido para este módulo
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
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleSelect(option.type)}
                  className="p-6 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg group-hover:scale-110 transition-transform">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {option.label}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
