'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import type { Partner, DocumentCategory } from '@/types';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  onSuccess: () => void;
}

const categories: Array<{ value: DocumentCategory; label: string; description: string }> = [
  { value: 'financial', label: 'Financiero', description: 'Reportes de comisiones, facturas, etc.' },
  { value: 'policy', label: 'Politica', description: 'Manuales, guias de uso, politicas' },
  { value: 'compliance', label: 'Compliance', description: 'Documentos de cumplimiento' },
  { value: 'correspondence', label: 'Correspondencia', description: 'Cartas y comunicaciones formales' },
  { value: 'certification', label: 'Certificacion', description: 'Certificados y acreditaciones' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];

export function ShareDocumentModal({ isOpen, onClose, partner, onSuccess }: ShareDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [expirationDate, setExpirationDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setFile(null);
    setExpirationDate('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo excede el tamano maximo de 10MB';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Usa PDF, DOC, DOCX, XLS, XLSX, PNG o JPG';
    }
    return null;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError('');

    // Auto-fill title if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !category || !title) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('partnerId', partner.id);
      if (expirationDate) {
        formData.append('expirationDate', expirationDate);
      }

      const res = await fetch('/api/sovra/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al subir el documento');
      }

      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el documento');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Compartir Documento</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">con {partner.companyName}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                required
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Selecciona una categoria</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Titulo del documento *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ej: Reporte de Comisiones Q4 2025"
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Descripcion (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Descripcion breve del documento..."
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Archivo *
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Arrastra un archivo o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--color-border)]">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading || !file || !category || !title}>
              {isUploading ? 'Subiendo...' : 'Compartir Documento'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
