'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  FileText,
  GraduationCap,
  History,
  Edit,
  Ban,
  PlayCircle,
  Trophy,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  X,
  Plus,
  AlertCircle,
  Check,
  MoreHorizontal,
  RefreshCw,
  Award,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Partner, PartnerTier, PartnerCredential, Deal, LegalDocument } from '@/types';

const tierConfig: Record<PartnerTier, { label: string; color: string; bgColor: string }> = {
  bronze: { label: 'Bronze', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  silver: { label: 'Silver', color: 'text-[var(--color-text-secondary)]', bgColor: 'bg-[var(--color-surface-hover)]' },
  gold: { label: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  platinum: { label: 'Platinum', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
};

const statusConfig = {
  active: { label: 'Activo', color: 'text-green-600', bgColor: 'bg-green-100' },
  suspended: { label: 'Suspendido', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const credentialStatusConfig = {
  pending: { label: 'Pendiente', color: 'text-[var(--color-text-secondary)]', bgColor: 'bg-[var(--color-surface-hover)]' },
  issued: { label: 'Emitida', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  claimed: { label: 'Reclamada', color: 'text-[var(--color-primary)]', bgColor: 'bg-blue-100' },
  active: { label: 'Activa', color: 'text-green-600', bgColor: 'bg-green-100' },
  revoked: { label: 'Revocada', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'opportunities', label: 'Oportunidades', icon: Briefcase },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'training', label: 'Capacitacion', icon: GraduationCap },
  { id: 'history', label: 'Historial', icon: History },
];

interface PartnerDetailData {
  partner: Partner;
  credentials: PartnerCredential[];
  deals: Deal[];
  documents: LegalDocument[];
  stats: {
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    pendingDeals: number;
    totalRevenue: number;
    credentialsCount: number;
    activeCredentials: number;
  };
}

// Issue Credential Modal
function IssueCredentialModal({
  isOpen,
  onClose,
  partnerId,
  partnerName,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    holderName: '',
    holderEmail: '',
    role: 'sales' as 'admin' | 'sales' | 'legal' | 'admin_secondary',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sovra/partners/${partnerId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al emitir credencial');
      }

      onSuccess();
      onClose();
      setFormData({ holderName: '', holderEmail: '', role: 'sales' });
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
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Emitir Credencial</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg p-3">
              Partner: <span className="font-medium">{partnerName}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nombre completo *</label>
              <input
                type="text"
                required
                value={formData.holderName}
                onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Maria Garcia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.holderEmail}
                onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="maria@acme.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Rol *</label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as typeof formData.role })
                }
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="admin">Admin - Acceso completo al portal</option>
                <option value="sales">Sales - Gestion de oportunidades</option>
                <option value="legal">Legal - Documentos y contratos</option>
                <option value="admin_secondary">Admin Secundario - Backup del admin</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Se enviara un email con link para descargar Sovra Wallet y codigo QR para reclamar la credencial.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Emitiendo...
                  </>
                ) : (
                  'Emitir Credencial'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Edit Partner Modal
function EditPartnerModal({
  isOpen,
  onClose,
  partner,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: partner.companyName,
    country: partner.country,
    tier: partner.tier,
    logoUrl: partner.logoUrl || '',
    contactName: partner.contactName,
    contactEmail: partner.contactEmail,
    contactPhone: partner.contactPhone || '',
  });

  useEffect(() => {
    setFormData({
      companyName: partner.companyName,
      country: partner.country,
      tier: partner.tier,
      logoUrl: partner.logoUrl || '',
      contactName: partner.contactName,
      contactEmail: partner.contactEmail,
      contactPhone: partner.contactPhone || '',
    });
  }, [partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sovra/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar partner');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Editar Partner</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nombre de empresa *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Pais *</label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nivel *</label>
                  <select
                    required
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as PartnerTier })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">URL del Logo</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <hr />

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Contacto principal *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tab: General
function GeneralTab({ data, onEdit }: { data: PartnerDetailData; onEdit: () => void }) {
  const { partner, stats } = data;
  const tier = tierConfig[partner.tier];
  const status = statusConfig[partner.status];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">Oportunidades</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalDeals}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-green-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Ganadas</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.wonDeals}</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Cert. Rate</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {stats.credentialsCount > 0
              ? Math.round((stats.activeCredentials / stats.credentialsCount) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Informacion de Contacto</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-secondary)]">{partner.contactName} (Admin)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
              <a href={`mailto:${partner.contactEmail}`} className="text-[var(--color-primary)] hover:underline">
                {partner.contactEmail}
              </a>
            </div>
            {partner.contactPhone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text-secondary)]">{partner.contactPhone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-secondary)]">{partner.country}</span>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Configuracion</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Nivel</span>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', tier.bgColor, tier.color)}>
                  {tier.label}
                </span>
                <button
                  onClick={onEdit}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Cambiar
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Status</span>
              <span className={cn('px-2 py-1 text-xs font-medium rounded-full', status.bgColor, status.color)}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Creado</span>
              <span className="text-sm text-[var(--color-text-primary)]">
                {new Date(partner.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            {partner.suspendedAt && (
              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="text-sm text-red-600 font-medium">Suspendido</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(partner.suspendedAt).toLocaleDateString('es-ES')} - {partner.suspendedReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab: Team (Credentials)
function TeamTab({ data, onRefresh }: { data: PartnerDetailData; onRefresh: () => void }) {
  const { partner, credentials } = data;
  const params = useParams();
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (credentialId: string) => {
    if (!confirm('¿Estas seguro de revocar esta credencial?')) return;

    setRevoking(credentialId);
    try {
      const response = await fetch(`/api/sovra/credentials/${credentialId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Revocada por admin' }),
      });

      if (!response.ok) throw new Error('Failed to revoke');
      onRefresh();
    } catch (error) {
      console.error('Error revoking credential:', error);
    } finally {
      setRevoking(null);
    }
  };

  const handleResend = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/sovra/credentials/${credentialId}/resend`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to resend');
      alert('QR reenviado exitosamente');
    } catch (error) {
      console.error('Error resending QR:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Equipo de {partner.companyName}</h3>
        <button
          onClick={() => setIssueModalOpen(true)}
          disabled={partner.status === 'suspended'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Emitir Credencial
        </button>
      </div>

      {partner.status === 'suspended' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Este partner esta suspendido. No se pueden emitir nuevas credenciales.
        </div>
      )}

      {credentials.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <Users className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">No hay credenciales emitidas</p>
          {partner.status === 'active' && (
            <button
              onClick={() => setIssueModalOpen(true)}
              className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
            >
              Emitir primera credencial
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((credential) => {
            const statusCfg = credentialStatusConfig[credential.status];
            return (
              <div
                key={credential.id}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {credential.holderName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{credential.holderName}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {credential.role.charAt(0).toUpperCase() + credential.role.slice(1)} • {credential.holderEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', statusCfg.bgColor, statusCfg.color)}>
                        {credential.status === 'active' && <ShieldCheck className="w-3 h-3 inline mr-1" />}
                        {credential.status === 'revoked' && <ShieldX className="w-3 h-3 inline mr-1" />}
                        {statusCfg.label}
                      </span>
                      {credential.claimedAt && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Reclamada {new Date(credential.claimedAt).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {credential.status === 'issued' && (
                    <button
                      onClick={() => handleResend(credential.id)}
                      className="px-3 py-1.5 text-sm text-[var(--color-primary)] hover:bg-blue-50 rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reenviar QR
                    </button>
                  )}
                  {['active', 'claimed', 'issued'].includes(credential.status) && (
                    <button
                      onClick={() => handleRevoke(credential.id)}
                      disabled={revoking === credential.id}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 disabled:opacity-50"
                    >
                      {revoking === credential.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                      Revocar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <IssueCredentialModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        partnerId={partner.id}
        partnerName={partner.companyName}
        onSuccess={onRefresh}
      />
    </div>
  );
}

// Tab: Opportunities
function OpportunitiesTab({ data }: { data: PartnerDetailData }) {
  const { deals } = data;
  const params = useParams();
  const locale = params.locale as string;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending_approval: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-100' },
    approved: { label: 'Aprobada', color: 'text-green-600 bg-green-100' },
    rejected: { label: 'Rechazada', color: 'text-red-600 bg-red-100' },
    more_info: { label: 'Info requerida', color: 'text-[var(--color-primary)] bg-blue-100' },
    closed_won: { label: 'Ganada', color: 'text-emerald-600 bg-emerald-100' },
    closed_lost: { label: 'Perdida', color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]' },
  };

  if (deals.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
        <Briefcase className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
        <p className="text-[var(--color-text-secondary)]">No hay oportunidades registradas</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <table className="w-full">
        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Cliente</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Pais</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Nivel</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deals.map((deal) => {
            const status = statusLabels[deal.status] || { label: deal.status, color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]' };
            return (
              <tr key={deal.id} className="hover:bg-[var(--color-surface-hover)]">
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/sovra/dashboard/approvals?deal=${deal.id}`}
                    className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                  >
                    {deal.clientName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{deal.country}</td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] capitalize">{deal.governmentLevel}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', status.color)}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  {new Date(deal.createdAt).toLocaleDateString('es-ES')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Tab: Documents
function DocumentsTab({ data }: { data: PartnerDetailData }) {
  const { documents } = data;
  const params = useParams();
  const locale = params.locale as string;

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Borrador', color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]' },
    pending_signature: { label: 'Pendiente firma', color: 'text-yellow-600 bg-yellow-100' },
    partially_signed: { label: 'Parcialmente firmado', color: 'text-[var(--color-primary)] bg-blue-100' },
    active: { label: 'Activo', color: 'text-green-600 bg-green-100' },
    expired: { label: 'Expirado', color: 'text-red-600 bg-red-100' },
    superseded: { label: 'Reemplazado', color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]' },
    archived: { label: 'Archivado', color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]' },
  };

  if (documents.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
        <FileText className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
        <p className="text-[var(--color-text-secondary)]">No hay documentos asociados</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <table className="w-full">
        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Documento</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Tipo</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] uppercase">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {documents.map((doc) => {
            const status = statusLabels[doc.status] || { label: doc.status, color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]' };
            return (
              <tr key={doc.id} className="hover:bg-[var(--color-surface-hover)]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--color-text-primary)]">{doc.title}</p>
                  {doc.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-xs">{doc.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] capitalize">{doc.category}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', status.color)}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Tab: Training
function TrainingTab({ data }: { data: PartnerDetailData }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
      <GraduationCap className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Progreso de capacitacion proximamente</p>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        Esta seccion mostrara el progreso de cursos completados por el equipo del partner.
      </p>
    </div>
  );
}

// Tab: History
function HistoryTab({ data }: { data: PartnerDetailData }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
      <History className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
      <p className="text-[var(--color-text-secondary)]">Historial de cambios proximamente</p>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        Esta seccion mostrara el log de todas las acciones realizadas sobre este partner.
      </p>
    </div>
  );
}

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const partnerId = params.partnerId as string;

  const [data, setData] = useState<PartnerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');
  const [editModalOpen, setEditModalOpen] = useState(searchParams.get('tab') === 'edit');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/sovra/partners/${partnerId}`);
      if (!response.ok) throw new Error('Failed to fetch partner');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching partner:', error);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuspend = async () => {
    if (!data) return;
    const reason = prompt('Razon de la suspension:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/sovra/partners/${partnerId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend');
      await fetchData();
    } catch (error) {
      console.error('Error suspending partner:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!confirm('¿Reactivar este partner?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/sovra/partners/${partnerId}/reactivate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reactivate');
      await fetchData();
    } catch (error) {
      console.error('Error reactivating partner:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">Partner no encontrado</p>
        <Link href={`/${locale}/sovra/dashboard/partners`} className="text-[var(--color-primary)] hover:underline mt-2 inline-block">
          Volver a partners
        </Link>
      </div>
    );
  }

  const { partner } = data;
  const tier = tierConfig[partner.tier];
  const status = statusConfig[partner.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href={`/${locale}/sovra/dashboard/partners`}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-4">
            {partner.logoUrl ? (
              <img
                src={partner.logoUrl}
                alt={partner.companyName}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{partner.companyName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-[var(--color-text-secondary)]">{partner.country}</span>
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', tier.bgColor, tier.color)}>
                  {tier.label}
                </span>
                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', status.bgColor, status.color)}>
                  {status.label}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  desde {new Date(partner.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          {partner.status === 'active' ? (
            <button
              onClick={handleSuspend}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              Suspender
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-2 disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              Reactivar
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)]'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralTab data={data} onEdit={() => setEditModalOpen(true)} />}
      {activeTab === 'team' && <TeamTab data={data} onRefresh={fetchData} />}
      {activeTab === 'opportunities' && <OpportunitiesTab data={data} />}
      {activeTab === 'documents' && <DocumentsTab data={data} />}
      {activeTab === 'training' && <TrainingTab data={data} />}
      {activeTab === 'history' && <HistoryTab data={data} />}

      {/* Edit Modal */}
      {data && (
        <EditPartnerModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          partner={data.partner}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
