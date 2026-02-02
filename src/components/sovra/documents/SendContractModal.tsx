'use client';

import { useState, useRef } from 'react';
import { X, Send, FileText, AlertCircle, Upload, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import type { Partner } from '@/types';

interface SendContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  onSuccess: () => void;
}

type ContractCategory = 'contract' | 'amendment';

const contractTypes: Array<{ value: ContractCategory; label: string; description: string }> = [
  { value: 'contract', label: 'Contrato', description: 'Acuerdos principales, NDA, etc.' },
  { value: 'amendment', label: 'Addendum', description: 'Modificaciones a contratos existentes' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function SendContractModal({ isOpen, onClose, partner, onSuccess }: SendContractModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ContractCategory | ''>('contract');
  const [file, setFile] = useState<File | null>(null);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Signers
  const [partnerSignerName, setPartnerSignerName] = useState(partner.name);
  const [partnerSignerEmail, setPartnerSignerEmail] = useState(partner.email);
  const [sovraSignerName, setSovraSignerName] = useState('Legal Sovra');
  const [sovraSignerEmail, setSovraSignerEmail] = useState('legal@sovra.io');

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('contract');
    setFile(null);
    setEffectiveDate('');
    setExpirationDate('');
    setPartnerSignerName(partner.name);
    setPartnerSignerEmail(partner.email);
    setSovraSignerName('Legal Sovra');
    setSovraSignerEmail('legal@sovra.io');
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
    if (file.type !== 'application/pdf') {
      return 'Solo se permiten archivos PDF para contratos DocuSign';
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

    if (!file || !category || !title || !partnerSignerEmail || !sovraSignerEmail) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(partnerSignerEmail) || !emailRegex.test(sovraSignerEmail)) {
      setError('Por favor ingresa emails validos');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('partnerId', partner.id);

      if (effectiveDate) formData.append('effectiveDate', effectiveDate);
      if (expirationDate) formData.append('expirationDate', expirationDate);

      // Signers info
      formData.append('partnerSignerName', partnerSignerName);
      formData.append('partnerSignerEmail', partnerSignerEmail);
      formData.append('sovraSignerName', sovraSignerName);
      formData.append('sovraSignerEmail', sovraSignerEmail);

      const res = await fetch('/api/sovra/documents/send-contract', {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Error al enviar el contrato');
      }

      // Show success message with document info
      console.log('[SendContractModal] Document created:', responseData.document?.id, 'for partner:', partner.id);
      alert(`Documento creado exitosamente!\n\nID: ${responseData.document?.id}\nPartner: ${partner.companyName} (${partner.id})\n\nNota: DocuSign esta en modo demo, los emails no se enviaran.`);

      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el contrato');
    } finally {
      setIsSending(false);
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
          className="bg-[var(--color-surface)] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Enviar Contrato DocuSign</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">a {partner.companyName}</p>
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

            {/* Type and Title Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Tipo de contrato *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContractCategory)}
                  required
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {contractTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Titulo del contrato *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ej: Acuerdo de Partner 2026"
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
                />
              </div>
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
                placeholder="Descripcion breve del contrato..."
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Fecha de vigencia
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={effectiveDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Signers */}
            <div className="border border-[var(--color-border)] rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                <User className="h-4 w-4" />
                Firmantes
              </h3>

              {/* Partner Signer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Nombre del Partner *
                  </label>
                  <input
                    type="text"
                    value={partnerSignerName}
                    onChange={(e) => setPartnerSignerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Email del Partner *
                  </label>
                  <input
                    type="email"
                    value={partnerSignerEmail}
                    onChange={(e) => setPartnerSignerEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* Sovra Signer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Nombre de Sovra *
                  </label>
                  <input
                    type="text"
                    value={sovraSignerName}
                    onChange={(e) => setSovraSignerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Email de Sovra *
                  </label>
                  <input
                    type="email"
                    value={sovraSignerEmail}
                    onChange={(e) => setSovraSignerEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Documento PDF *
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
                  accept=".pdf"
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
                      Arrastra un archivo PDF o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Solo archivos PDF (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-[var(--color-primary)]/10 rounded-lg p-3 text-sm text-[var(--color-primary)]">
              <p>
                <strong>Nota:</strong> El contrato sera enviado a ambos firmantes via DocuSign.
                Recibiran un email con el enlace para firmar.
              </p>
            </div>

            {/* Mock Mode Warning */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-600 dark:text-amber-400">
              <p>
                <strong>Modo Demo:</strong> DocuSign no esta configurado. Los documentos se crearan
                pero los emails de firma no se enviaran. Para activar DocuSign, configura las
                variables de entorno necesarias.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--color-border)]">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSending || !file || !title}>
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Enviando...' : 'Enviar Contrato'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
