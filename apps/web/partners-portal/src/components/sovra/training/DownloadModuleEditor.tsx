'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Save,
  Loader2,
  Trash2,
  Edit2,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  ChevronDown,
  AlertCircle,
  X,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { MultiLangInput } from './MultiLangInput';
import { FileUploadZone } from './FileUploadZone';
import type { EnhancedCourseModule, LocalizedString } from '@/types';

// ============================================
// Type Definitions
// ============================================

interface DownloadModuleEditorProps {
  module: EnhancedCourseModule;
  onChange: (module: EnhancedCourseModule) => void;
  onSave: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

type FileType = 'pdf' | 'doc' | 'xls' | 'ppt' | 'zip' | 'img' | 'other';

interface DownloadFile {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  url: string;
  type: FileType;
  size: number;
  mimeType: string;
}

// Extended module type for download modules
interface DownloadModule extends EnhancedCourseModule {
  files?: DownloadFile[];
}

// ============================================
// Constants
// ============================================

const FILE_TYPE_ICONS: Record<FileType, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6 text-red-500" />,
  doc: <FileText className="w-6 h-6 text-blue-500" />,
  xls: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
  ppt: <FileText className="w-6 h-6 text-orange-500" />,
  zip: <File className="w-6 h-6 text-yellow-600" />,
  img: <FileImage className="w-6 h-6 text-purple-500" />,
  other: <File className="w-6 h-6 text-[var(--color-text-secondary)]" />,
};

const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  doc: 'Documento',
  xls: 'Hoja de calculo',
  ppt: 'Presentacion',
  zip: 'Comprimido',
  img: 'Imagen',
  other: 'Archivo',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine file type from MIME type or extension
 */
function getFileType(mimeType: string, fileName: string): FileType {
  // Check MIME type first
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) return 'zip';
  if (mimeType.startsWith('image/')) return 'img';

  // Fallback to extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return 'other';

  switch (extension) {
    case 'pdf': return 'pdf';
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf': return 'doc';
    case 'xls':
    case 'xlsx':
    case 'csv': return 'xls';
    case 'ppt':
    case 'pptx': return 'ppt';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz': return 'zip';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg': return 'img';
    default: return 'other';
  }
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

// ============================================
// File Item Component
// ============================================

interface FileItemProps {
  file: DownloadFile;
  onUpdate: (file: DownloadFile) => void;
  onDelete: () => void;
}

function FileItem({ file, onUpdate, onDelete }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
      {/* Collapsed View */}
      <div className="flex items-center gap-3 p-3">
        {/* File Type Icon */}
        <div className="flex-shrink-0">
          {FILE_TYPE_ICONS[file.type]}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-[var(--color-text-primary)]">
            {file.name.es || file.name.en || 'Archivo sin nombre'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {FILE_TYPE_LABELS[file.type]}
            </span>
            <span className="text-xs text-[var(--color-border)]">|</span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
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
                value={file.name}
                onChange={(name) => onUpdate({ ...file, name })}
                placeholder={{ es: 'Nombre descriptivo', en: 'Descriptive name', pt: 'Nome descritivo' }}
              />
              <MultiLangInput
                label="Descripcion"
                value={file.description}
                onChange={(description) => onUpdate({ ...file, description })}
                type="textarea"
                placeholder={{ es: 'Describe el contenido del archivo', en: 'Describe the file contents', pt: 'Descreva o conteudo do arquivo' }}
              />
              <div className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] p-2 rounded">
                URL: {file.url}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Delete Confirmation Dialog
// ============================================

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ isOpen, fileName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 text-red-500 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] text-center mb-2">
          Eliminar archivo?
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
          Estas a punto de eliminar: <span className="font-medium text-[var(--color-text-primary)]">&quot;{fileName}&quot;</span>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function DownloadModuleEditor({
  module,
  onChange,
  onSave,
}: DownloadModuleEditorProps) {
  // Cast module to extended type
  const downloadModule = module as DownloadModule;

  // State
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
  });

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
      formData.append('type', 'download');

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

      // Create new file entry
      const fileType = getFileType(file.type, file.name);
      const newFile: DownloadFile = {
        id: generateId(),
        name: { es: file.name, en: file.name, pt: file.name },
        description: { es: '', en: '', pt: '' },
        url: data.url,
        type: fileType,
        size: file.size,
        mimeType: file.type,
      };

      // Add to module files
      const currentFiles = downloadModule.files || [];
      onChange({
        ...module,
        ...({ files: [...currentFiles, newFile] } as Partial<DownloadModule>),
      } as EnhancedCourseModule);

      // Clear files error
      if (errors['files']) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors['files'];
          return newErrors;
        });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
    }
  }, [module, downloadModule.files, onChange, errors]);

  const handleFileUpdate = useCallback((updatedFile: DownloadFile) => {
    const currentFiles = downloadModule.files || [];
    const updatedFiles = currentFiles.map((f) =>
      f.id === updatedFile.id ? updatedFile : f
    );
    onChange({
      ...module,
      ...({ files: updatedFiles } as Partial<DownloadModule>),
    } as EnhancedCourseModule);
  }, [module, downloadModule.files, onChange]);

  const handleFileDelete = useCallback((file: DownloadFile) => {
    const fileName = file.name.es || file.name.en || 'Archivo sin nombre';
    setDeleteDialog({
      isOpen: true,
      fileId: file.id,
      fileName: fileName.length > 50 ? fileName.substring(0, 50) + '...' : fileName,
    });
  }, []);

  const handleConfirmDelete = () => {
    const currentFiles = downloadModule.files || [];
    const filteredFiles = currentFiles.filter((f) => f.id !== deleteDialog.fileId);
    onChange({
      ...module,
      ...({ files: filteredFiles } as Partial<DownloadModule>),
    } as EnhancedCourseModule);
    setDeleteDialog({ isOpen: false, fileId: '', fileName: '' });
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

    // Files validation
    const files = downloadModule.files || [];
    if (files.length === 0) {
      newErrors['files'] = 'Se requiere al menos 1 archivo para descargar';
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

  const files = downloadModule.files || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Modulo de Descarga
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Proporciona archivos para que los usuarios descarguen
          </p>
        </div>
      </div>

      {/* Module Title */}
      <MultiLangInput
        label="Titulo del Modulo"
        value={module.title || { es: '', en: '', pt: '' }}
        onChange={handleTitleChange}
        required
        placeholder={{ es: 'Material de apoyo', en: 'Support material', pt: 'Material de apoio' }}
        error={errors['title.es']}
      />

      {/* Duration */}
      <div>
        <label className={labelClasses}>
          Duracion del Modulo (minutos) <span className="text-red-500">*</span>
        </label>
        <div className="relative max-w-xs">
          <input
            type="number"
            min={1}
            max={300}
            value={module.duration || 5}
            onChange={handleDurationChange}
            className={`${inputClasses} pr-10`}
          />
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
        </div>
        {errors['duration'] && (
          <p className="text-sm text-red-500 mt-1">{errors['duration']}</p>
        )}
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Tiempo estimado para revisar los archivos
        </p>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        <label className={labelClasses}>
          Archivos para Descargar <span className="text-red-500">*</span>
        </label>

        {/* Existing Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onUpdate={handleFileUpdate}
                onDelete={() => handleFileDelete(file)}
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
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
            maxSize={100 * 1024 * 1024} // 100MB
            label="Arrastra archivos o haz clic para agregar"
            supportedFormats={['PDF', 'DOC', 'XLS', 'PPT', 'TXT', 'ZIP']}
            error={uploadError || undefined}
          />
        </div>

        {errors['files'] && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors['files']}
          </p>
        )}

        {files.length > 0 && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {files.length} archivo{files.length !== 1 ? 's' : ''} - Tamano total: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
          </p>
        )}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        fileName={deleteDialog.fileName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, fileId: '', fileName: '' })}
      />
    </motion.div>
  );
}
