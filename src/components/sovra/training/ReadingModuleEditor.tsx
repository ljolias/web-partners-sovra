'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Save,
  Loader2,
  Upload,
  Trash2,
  FileText,
  Clock,
  ChevronDown,
  Edit2,
  X,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import { MultiLangTipTap } from './MultiLangTipTap';
import { FileUploadZone } from './FileUploadZone';
import type { EnhancedCourseModule, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface ReadingModuleEditorProps {
  module: EnhancedCourseModule;
  onChange: (module: EnhancedCourseModule) => void;
  onSave: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Attachment {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  url: string;
  type: string;
  size: number;
}

// Extended module type for reading modules
interface ReadingModule extends EnhancedCourseModule {
  attachments?: Attachment[];
  estimatedReadingTime?: number;
}

// ============================================
// Constants
// ============================================

const WORDS_PER_MINUTE = 200; // Average reading speed

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate reading time from HTML content
 */
function calculateReadingTime(content: LocalizedString): number {
  // Get the primary content (Spanish or first available)
  const text = content.es || content.en || Object.values(content)[0] || '';

  // Strip HTML tags
  const strippedText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  // Count words
  const wordCount = strippedText.split(' ').filter(word => word.length > 0).length;

  // Calculate minutes (minimum 1 minute)
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Attachment Item Component
// ============================================

interface AttachmentItemProps {
  attachment: Attachment;
  onUpdate: (attachment: Attachment) => void;
  onDelete: () => void;
}

function AttachmentItem({ attachment, onUpdate, onDelete }: AttachmentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
      {/* Collapsed View */}
      <div className="flex items-center gap-3 p-3">
        <FileText className="w-8 h-8 text-[var(--color-primary)] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-[var(--color-text-primary)]">
            {attachment.name.es || attachment.name.en || 'Archivo adjunto'}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {formatFileSize(attachment.size)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Edit View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-[var(--color-border)]">
              <MultiLangInput
                label="Nombre del Archivo"
                value={attachment.name}
                onChange={(name) => onUpdate({ ...attachment, name })}
                placeholder={{ es: 'Nombre del archivo', en: 'File name', pt: 'Nome do arquivo' }}
              />
              <MultiLangInput
                label="Descripcion"
                value={attachment.description}
                onChange={(description) => onUpdate({ ...attachment, description })}
                type="textarea"
                placeholder={{ es: 'Descripcion opcional', en: 'Optional description', pt: 'Descricao opcional' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ReadingModuleEditor({
  module,
  onChange,
  onSave,
}: ReadingModuleEditorProps) {
  // Cast module to extended type
  const readingModule = module as ReadingModule;

  // State
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ============================================
  // Computed Values
  // ============================================

  // Calculate estimated reading time from content
  const estimatedReadingTime = useMemo(() => {
    return calculateReadingTime(module.content || { es: '', en: '', pt: '' });
  }, [module.content]);

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

  const handleContentChange = (value: LocalizedString) => {
    onChange({ ...module, content: value });
    if (errors['content.es']) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['content.es'];
        return newErrors;
      });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(300, parseInt(e.target.value) || 1));
    onChange({ ...module, duration: value });
  };

  // ============================================
  // File Upload Handler
  // ============================================

  const handleFileUpload = useCallback(async (file: File | null) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'attachment');

      // Upload to API
      const response = await fetch('/api/sovra/training/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir el archivo');
      }

      const data = await response.json();

      // Create new attachment
      const newAttachment: Attachment = {
        id: generateId(),
        name: { es: file.name, en: file.name, pt: file.name },
        description: { es: '', en: '', pt: '' },
        url: data.url,
        type: file.type,
        size: file.size,
      };

      // Add to module attachments
      const currentAttachments = readingModule.attachments || [];
      onChange({
        ...module,
        ...({ attachments: [...currentAttachments, newAttachment] } as Partial<ReadingModule>),
      } as EnhancedCourseModule);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
    }
  }, [module, readingModule.attachments, onChange]);

  const handleAttachmentUpdate = useCallback((updatedAttachment: Attachment) => {
    const currentAttachments = readingModule.attachments || [];
    const updatedAttachments = currentAttachments.map((a) =>
      a.id === updatedAttachment.id ? updatedAttachment : a
    );
    onChange({
      ...module,
      ...({ attachments: updatedAttachments } as Partial<ReadingModule>),
    } as EnhancedCourseModule);
  }, [module, readingModule.attachments, onChange]);

  const handleAttachmentDelete = useCallback((attachmentId: string) => {
    const currentAttachments = readingModule.attachments || [];
    const filteredAttachments = currentAttachments.filter((a) => a.id !== attachmentId);
    onChange({
      ...module,
      ...({ attachments: filteredAttachments } as Partial<ReadingModule>),
    } as EnhancedCourseModule);
  }, [module, readingModule.attachments, onChange]);

  // ============================================
  // Validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!module.title?.es || module.title.es.trim() === '') {
      newErrors['title.es'] = 'El titulo en espanol es requerido';
    }

    // Content validation
    const content = module.content?.es || '';
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) {
      newErrors['content.es'] = 'El contenido en espanol es requerido';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Modulo de Lectura
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Crea contenido de texto enriquecido con archivos adjuntos
          </p>
        </div>
      </div>

      {/* Module Title */}
      <MultiLangInput
        label="Titulo del Modulo"
        value={module.title || { es: '', en: '', pt: '' }}
        onChange={handleTitleChange}
        required
        placeholder={{ es: 'Fundamentos de ventas', en: 'Sales fundamentals', pt: 'Fundamentos de vendas' }}
        error={errors['title.es']}
      />

      {/* Content Editor */}
      <div className="space-y-2">
        <MultiLangTipTap
          label="Contenido"
          value={module.content || { es: '', en: '', pt: '' }}
          onChange={handleContentChange}
        />
        {errors['content.es'] && (
          <p className="text-sm text-red-500">{errors['content.es']}</p>
        )}
      </div>

      {/* Reading Time and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>
            Tiempo de Lectura Estimado
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-hover)] rounded-lg">
            <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-sm text-[var(--color-text-primary)]">
              {estimatedReadingTime} min
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              (calculado automaticamente)
            </span>
          </div>
        </div>

        <div>
          <label className={labelClasses}>
            Duracion del Modulo (minutos) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={300}
            value={module.duration || estimatedReadingTime}
            onChange={handleDurationChange}
            className={inputClasses}
          />
          {errors['duration'] && (
            <p className="text-sm text-red-500 mt-1">{errors['duration']}</p>
          )}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-3">
        <label className={labelClasses}>
          Archivos Adjuntos
        </label>

        {/* Existing Attachments */}
        {readingModule.attachments && readingModule.attachments.length > 0 && (
          <div className="space-y-2">
            {readingModule.attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                attachment={attachment}
                onUpdate={handleAttachmentUpdate}
                onDelete={() => handleAttachmentDelete(attachment.id)}
              />
            ))}
          </div>
        )}

        {/* Upload Zone */}
        <div className="relative">
          {uploading && (
            <div className="absolute inset-0 bg-[var(--color-surface)]/80 flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                <span className="text-sm text-[var(--color-text-primary)]">Subiendo archivo...</span>
              </div>
            </div>
          )}
          <FileUploadZone
            onFileSelect={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
            maxSize={50 * 1024 * 1024} // 50MB
            label="Arrastra archivos o haz clic para agregar adjuntos"
            supportedFormats={['PDF', 'DOC', 'XLS', 'PPT', 'TXT', 'ZIP']}
            error={uploadError || undefined}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
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
