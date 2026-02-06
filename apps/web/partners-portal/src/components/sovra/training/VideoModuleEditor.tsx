'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Save,
  AlertCircle,
  Check,
  Loader2,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import {
  extractYoutubeVideoId,
  getYoutubeThumbnail,
  isValidYoutubeUrl,
} from '@/lib/youtube';
import type { EnhancedCourseModule, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface VideoModuleEditorProps {
  module: EnhancedCourseModule;
  onChange: (module: EnhancedCourseModule) => void;
  onSave: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

// ============================================
// Constants
// ============================================

// Default video duration in minutes (used when we can't fetch from YouTube API)
const DEFAULT_VIDEO_DURATION = 10;

// ============================================
// Main Component
// ============================================

export function VideoModuleEditor({
  module,
  onChange,
  onSave,
}: VideoModuleEditorProps) {
  // State
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState(module.videoUrl || '');

  // ============================================
  // Video URL Processing
  // ============================================

  /**
   * Process YouTube URL to extract video ID and thumbnail
   */
  const processVideoUrl = useCallback((url: string) => {
    if (!url.trim()) {
      setVideoId(null);
      setThumbnailUrl('');
      return;
    }

    const extractedId = extractYoutubeVideoId(url);
    if (extractedId) {
      setVideoId(extractedId);
      setThumbnailUrl(getYoutubeThumbnail(extractedId));
      // Clear any previous URL error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.videoUrl;
        return newErrors;
      });
    } else {
      setVideoId(null);
      setThumbnailUrl('');
      setErrors((prev) => ({
        ...prev,
        videoUrl: 'URL de YouTube invalida. Usa un formato como: https://youtube.com/watch?v=xxxx',
      }));
    }
  }, []);

  // Process URL on mount and when urlInput changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processVideoUrl(urlInput);
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [urlInput, processVideoUrl]);

  // ============================================
  // Form Handlers
  // ============================================

  const handleTitleChange = (value: LocalizedString) => {
    onChange({ ...module, title: value });
    if (errors['title.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['title.es'];
        return newErrors;
      });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    onChange({
      ...module,
      videoUrl: url,
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(300, parseInt(e.target.value) || 1));
    onChange({ ...module, duration: value });
  };

  // Handle required watch percentage (stored in module metadata or a custom field)
  // For this implementation, we store it in a custom extension field
  const handleRequiredWatchPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
    onChange({
      ...module,
      // Store in a type-safe way - extending module with custom fields
      ...({ requiredWatchPercentage: value } as Partial<EnhancedCourseModule>),
    } as EnhancedCourseModule);
  };

  const handleAllowSkipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...module,
      ...({ allowSkip: e.target.checked } as Partial<EnhancedCourseModule>),
    } as EnhancedCourseModule);
  };

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!module.title?.es || module.title.es.trim() === '') {
      newErrors['title.es'] = 'El titulo en espanol es requerido';
    }

    // URL validation
    if (!module.videoUrl || !isValidYoutubeUrl(module.videoUrl)) {
      newErrors['videoUrl'] = 'Se requiere una URL de YouTube valida';
    }

    // Duration validation
    if (!module.duration || module.duration < 1) {
      newErrors['duration'] = 'La duracion debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Save Handler
  // ============================================

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      onSave();
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  const inputClasses = 'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors';
  const labelClasses = 'block text-sm font-medium text-[var(--color-text-primary)] mb-1';

  // Get extended properties with defaults
  const requiredWatchPercentage = (module as EnhancedCourseModule & { requiredWatchPercentage?: number }).requiredWatchPercentage ?? 80;
  const allowSkip = (module as EnhancedCourseModule & { allowSkip?: boolean }).allowSkip ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
          <Play className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Modulo de Video
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Configura el contenido de video desde YouTube
          </p>
        </div>
      </div>

      {/* Module Title */}
      <MultiLangInput
        label="Titulo del Modulo"
        value={module.title || { es: '', en: '', pt: '' }}
        onChange={handleTitleChange}
        required
        placeholder={{ es: 'Introduccion al tema', en: 'Introduction to topic', pt: 'Introducao ao tema' }}
        error={errors['title.es']}
      />

      {/* YouTube URL */}
      <div className="space-y-2">
        <label className={labelClasses}>
          URL de YouTube <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`${inputClasses} pr-10`}
          />
          {videoId && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
        {errors['videoUrl'] && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors['videoUrl']}
          </p>
        )}

        {/* Thumbnail Preview */}
        {thumbnailUrl && videoId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mt-3 rounded-lg overflow-hidden border border-[var(--color-border)]"
          >
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-8 h-8 text-[var(--color-primary)] ml-1" />
              </div>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1 hover:bg-white transition-colors"
            >
              Ver en YouTube
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </div>

      {/* Duration and Watch Percentage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>
            Duracion (minutos) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={300}
              value={module.duration || DEFAULT_VIDEO_DURATION}
              onChange={handleDurationChange}
              className={`${inputClasses} pr-10`}
            />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          </div>
          {errors['duration'] && (
            <p className="text-sm text-red-500 mt-1">{errors['duration']}</p>
          )}
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Ingresa la duracion del video en minutos
          </p>
        </div>

        <div>
          <label className={labelClasses}>
            Porcentaje Requerido (%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={requiredWatchPercentage}
            onChange={handleRequiredWatchPercentageChange}
            className="w-full h-2 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
            <span>0%</span>
            <span className="font-medium text-[var(--color-primary)]">{requiredWatchPercentage}%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Porcentaje minimo que el usuario debe ver para completar
          </p>
        </div>
      </div>

      {/* Allow Skip Toggle */}
      <div className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] rounded-lg">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Permitir Saltar
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Los usuarios pueden omitir este video sin verlo completo
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allowSkip}
            onChange={handleAllowSkipChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]" />
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Modulo
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
