'use client';

import { useState } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  currentFile?: { name: string; url: string; size: number } | File;
  error?: string;
  label?: string;
  supportedFormats?: string[];
}

export function FileUploadZone({
  onFileSelect,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  currentFile,
  error,
  label = 'Arrastra un archivo o haz clic para seleccionar',
  supportedFormats = [],
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const validateAndSelect = (file: File) => {
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      alert(`Archivo muy grande. Máximo: ${maxSizeMB}MB`);
      return;
    }
    onFileSelect(file);
  };

  const displayFile = currentFile instanceof File
    ? { name: currentFile.name, size: currentFile.size }
    : currentFile;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {!displayFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${
              isDragging
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
            }
          `}
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-secondary)]" />
          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
            {label}
          </p>
          {supportedFormats.length > 0 && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              Formatos: {supportedFormats.join(', ')}
            </p>
          )}
          <input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
          <FileIcon className="w-8 h-8 text-[var(--color-primary)] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[var(--color-text-primary)]">
              {displayFile.name}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {formatFileSize(displayFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
