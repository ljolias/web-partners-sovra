'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Building2,
  Users,
  Trophy,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  PlayCircle,
  FileText,
  Briefcase,
  ChevronDown,
  X,
  BadgeCheck,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Partner, PartnerTier } from '@/types';

const tierConfig: Record<PartnerTier, { label: string; color: string; icon: string }> = {
  bronze: { label: 'Bronze', color: 'text-amber-600 bg-amber-500/10', icon: '' },
  silver: { label: 'Silver', color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]', icon: '' },
  gold: { label: 'Gold', color: 'text-yellow-500 bg-yellow-500/10', icon: '' },
  platinum: { label: 'Platinum', color: 'text-indigo-400 bg-indigo-500/10', icon: '' },
};

const statusConfig = {
  active: { label: 'Activo', color: 'text-green-500 bg-green-500/10' },
  suspended: { label: 'Suspendido', color: 'text-red-500 bg-red-500/10' },
};

const countries = [
  { code: 'AR', name: 'Argentina' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'EC', name: 'Ecuador' },
];

interface PartnerWithStats extends Partner {
  usersCount?: number;
  certificationsCount?: number;
}

interface CreatePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePartnerModal({ isOpen, onClose, onSuccess }: CreatePartnerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoInputMode, setLogoInputMode] = useState<'url' | 'upload'>('url');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    country: '',
    tier: 'bronze' as PartnerTier,
    logoUrl: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('El archivo no debe superar 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoPreview(dataUrl);
        setFormData({ ...formData, logoUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sovra/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear partner');
      }

      onSuccess();
      onClose();
      setFormData({
        companyName: '',
        country: '',
        tier: 'bronze',
        logoUrl: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
      setLogoPreview(null);
      setLogoInputMode('url');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Nuevo Partner</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Informacion de la Empresa</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Nombre de empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Pais *
                  </label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                  >
                    <option value="">Seleccionar pais...</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Nivel inicial *
                  </label>
                  <select
                    required
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as PartnerTier })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Logo (opcional)
                  </label>

                  {/* Logo input mode tabs */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLogoInputMode('upload');
                        setFormData({ ...formData, logoUrl: '' });
                        setLogoPreview(null);
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        logoInputMode === 'upload'
                          ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                      )}
                    >
                      <Upload className="w-4 h-4" />
                      Subir archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoInputMode('url');
                        setFormData({ ...formData, logoUrl: '' });
                        setLogoPreview(null);
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        logoInputMode === 'url'
                          ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                      )}
                    >
                      <LinkIcon className="w-4 h-4" />
                      URL
                    </button>
                  </div>

                  {logoInputMode === 'upload' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--color-border)] border-dashed rounded-lg cursor-pointer bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Preview" className="w-16 h-16 object-contain mb-2" />
                            ) : (
                              <Upload className="w-8 h-8 mb-2 text-[var(--color-text-secondary)]" />
                            )}
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {logoPreview ? 'Click para cambiar' : 'Click para subir'}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">PNG, JPG (max 2MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                      placeholder="https://example.com/logo.png"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Administrador del Partner</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                    placeholder="Juan Perez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                    placeholder="juan@acme.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                    Telefono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Partner'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface PartnerCardProps {
  partner: PartnerWithStats;
  onView: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}

function PartnerCard({ partner, onView, onSuspend, onReactivate, onDelete }: PartnerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const tier = tierConfig[partner.tier];
  const status = statusConfig[partner.status];

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {partner.logoUrl ? (
            <img
              src={partner.logoUrl}
              alt={partner.companyName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-purple)] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">{partner.companyName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[var(--color-text-secondary)]">{partner.country}</span>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', tier.color)}>
                {tier.label}
              </span>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', status.color)}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] z-20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onView();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/${locale}/sovra/dashboard/partners/${partner.id}?tab=edit`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/${locale}/sovra/dashboard/approvals?partner=${partner.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <Briefcase className="w-4 h-4" />
                    Ver oportunidades
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/${locale}/sovra/dashboard/documents?partner=${partner.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <FileText className="w-4 h-4" />
                    Ver documentos
                  </button>
                  <hr className="my-1" />
                  {partner.status === 'active' ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onSuspend();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4" />
                      Suspender
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onReactivate();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Reactivar
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar cuenta
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center py-3 border-t border-[var(--color-border)]">
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">{partner.totalDeals || 0}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Oportunidades</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">{partner.wonDeals || 0}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Ganadas</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
            ${((partner.totalRevenue || 0) / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Revenue</p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{partner.usersCount || 0} usuarios</span>
        </div>
        <div className="flex items-center gap-1">
          <BadgeCheck className="w-4 h-4" />
          <span>{partner.certificationsCount || 0} certificaciones</span>
        </div>
      </div>
    </div>
  );
}

interface SuspendModalProps {
  isOpen: boolean;
  partner: Partner | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

function SuspendModal({ isOpen, partner, onClose, onConfirm, loading }: SuspendModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !partner) return null;

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md border border-[var(--color-border)]"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Suspender Partner</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{partner.companyName}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              Al suspender este partner, todas sus credenciales SovraID seran revocadas automaticamente.
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Razon de la suspension *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Describe la razon de la suspension..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => onConfirm(reason)}
                disabled={!reason.trim() || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Suspendiendo...
                  </>
                ) : (
                  'Suspender Partner'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  partner: Partner | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteModal({ isOpen, partner, onClose, onConfirm, loading }: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !partner) return null;

  const canDelete = confirmText === partner.companyName;

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md border border-[var(--color-border)]"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Eliminar Partner</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{partner.companyName}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-2">Esta accion es irreversible</p>
                  <p className="mb-2">Al eliminar este partner se borraran permanentemente:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Todos los datos de la empresa</li>
                    <li>Todos los usuarios y credenciales</li>
                    <li>Historial de oportunidades</li>
                    <li>Documentos legales firmados</li>
                    <li>Progreso de capacitacion</li>
                    <li>Registros de auditoria asociados</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Escribe <span className="font-mono bg-[var(--color-surface-hover)] px-1 rounded">{partner.companyName}</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={partner.companyName}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmText('');
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)]"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={!canDelete || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar permanentemente
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PartnersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [partners, setPartners] = useState<PartnerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; partner: Partner | null }>({
    open: false,
    partner: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; partner: Partner | null }>({
    open: false,
    partner: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCountry) params.set('country', filterCountry);
      if (filterTier) params.set('tier', filterTier);
      if (filterStatus) params.set('status', filterStatus);

      const response = await fetch(`/api/sovra/partners?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch partners');
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  }, [filterCountry, filterTier, filterStatus]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSuspend = async (reason: string) => {
    if (!suspendModal.partner) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/sovra/partners/${suspendModal.partner.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend partner');

      await fetchPartners();
      setSuspendModal({ open: false, partner: null });
    } catch (error) {
      console.error('Error suspending partner:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (partner: Partner) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/sovra/partners/${partner.id}/reactivate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reactivate partner');

      await fetchPartners();
    } catch (error) {
      console.error('Error reactivating partner:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.partner) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/sovra/partners/${deleteModal.partner.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete partner');

      await fetchPartners();
      setDeleteModal({ open: false, partner: null });
    } catch (error) {
      console.error('Error deleting partner:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter partners by search query
  const filteredPartners = partners.filter((partner) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      partner.companyName.toLowerCase().includes(query) ||
      partner.contactName?.toLowerCase().includes(query) ||
      partner.contactEmail?.toLowerCase().includes(query)
    );
  });

  // Summary stats
  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === 'active').length,
    suspended: partners.filter((p) => p.status === 'suspended').length,
    byTier: {
      bronze: partners.filter((p) => p.tier === 'bronze').length,
      silver: partners.filter((p) => p.tier === 'silver').length,
      gold: partners.filter((p) => p.tier === 'gold').length,
      platinum: partners.filter((p) => p.tier === 'platinum').length,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Partners</h1>
          <p className="text-[var(--color-text-secondary)]">Gestiona los partners del ecosistema Sovra</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] !text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Partner
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Total Partners</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Activos</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Suspendidos</p>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Por Nivel</p>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{stats.byTier.bronze}</span>
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">{stats.byTier.silver}</span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-600">{stats.byTier.gold}</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600">{stats.byTier.platinum}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-primary)]"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm text-[var(--color-text-primary)]"
            >
              <option value="">Todos los paises</option>
              {countries.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm text-[var(--color-text-primary)]"
            >
              <option value="">Todos los niveles</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm text-[var(--color-text-primary)]"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto" />
          <p className="text-[var(--color-text-secondary)] mt-4">Cargando partners...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <Building2 className="w-12 h-12 text-[var(--color-text-secondary)] opacity-50 mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">No se encontraron partners</p>
          {(searchQuery || filterCountry || filterTier || filterStatus) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCountry('');
                setFilterTier('');
                setFilterStatus('');
              }}
              className="mt-2 text-sm text-[var(--color-primary)] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onView={() => router.push(`/${locale}/sovra/dashboard/partners/${partner.id}`)}
              onSuspend={() => setSuspendModal({ open: true, partner })}
              onReactivate={() => handleReactivate(partner)}
              onDelete={() => setDeleteModal({ open: true, partner })}
            />
          ))}
        </div>
      )}

      {/* Create Partner Modal */}
      <CreatePartnerModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchPartners}
      />

      {/* Suspend Partner Modal */}
      <SuspendModal
        isOpen={suspendModal.open}
        partner={suspendModal.partner}
        onClose={() => setSuspendModal({ open: false, partner: null })}
        onConfirm={handleSuspend}
        loading={actionLoading}
      />

      {/* Delete Partner Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        partner={deleteModal.partner}
        onClose={() => setDeleteModal({ open: false, partner: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
