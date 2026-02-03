'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Users, UserCheck, Briefcase, DollarSign, Plus, X, AlertCircle, Check, ShieldCheck, Clock, Mail, Eye } from 'lucide-react';
import { Card, CardContent, SovraLoader } from '@/components/ui';
import { TeamMemberCard } from './TeamMemberCard';
import { formatCurrency } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import type { TeamMemberSummary, User, UserRole, PartnerCredential } from '@/types';

interface TeamDashboardProps {
  locale: string;
}

export function TeamDashboard({ locale }: TeamDashboardProps) {
  const t = useTranslations('team');
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMemberSummary[]>([]);
  const [pendingCredentials, setPendingCredentials] = useState<PartnerCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [viewQRCredential, setViewQRCredential] = useState<PartnerCredential | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch team data
      const res = await fetch('/api/partners/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.teamMembers || []);
        setPendingCredentials(data.pendingCredentials || []);
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    }
  }, []);

  useEffect(() => {
    async function checkAccessAndFetch() {
      try {
        // Check user permissions
        const userRes = await fetch('/api/partners/auth/me');
        if (!userRes.ok) {
          router.replace(`/${locale}/partners/login`);
          return;
        }
        const userData = await userRes.json();
        const user = userData.user as User;
        setCurrentUser(user);

        if (!hasPermission(user.role as UserRole, 'team:view')) {
          router.replace(`/${locale}/partners/portal`);
          return;
        }

        setIsAuthorized(true);
        await fetchData();
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccessAndFetch();
  }, [locale, router, fetchData]);

  const handleCredentialIssued = () => {
    fetchData(); // Refresh the data
  };

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Check if current user is admin (can add team members)
  const canAddMembers = currentUser?.role === 'admin';

  // Calculate aggregate stats
  const totalMembers = teamMembers.length;
  const totalDeals = teamMembers.reduce((sum, m) => sum + m.metrics.totalDeals, 0);
  const totalRevenue = teamMembers.reduce((sum, m) => sum + m.metrics.totalRevenue, 0);
  const certifiedMembers = teamMembers.filter(
    (m) => m.metrics.activeCertificationsCount > 0
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
        {canAddMembers && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)]"
          >
            <Plus className="w-4 h-4" />
            {t('addMember')}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                <Users className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('totalMembers')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('certifiedMembers')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{certifiedMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Briefcase className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('teamDeals')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent-purple)]/10">
                <DollarSign className="h-6 w-6 text-[var(--color-accent-purple)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('teamRevenue')}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Credentials */}
      {pendingCredentials.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            {t('pendingCredentials')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingCredentials.map((credential) => (
              <Card key={credential.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{credential.holderName}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{credential.holderEmail}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600">
                        {credential.role} - {t('pendingClaim')}
                      </span>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <ShieldCheck className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t('waitingClaim')}
                    </p>
                    <button
                      onClick={() => setViewQRCredential(credential)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg"
                    >
                      <Eye className="w-3 h-3" />
                      {t('viewQR')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          {t('members')}
        </h2>
        {teamMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={member.user.id} member={member} index={index} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-[var(--color-text-secondary)] opacity-50" />
              <p className="mt-4 text-[var(--color-text-secondary)]">{t('empty')}</p>
              {canAddMembers && (
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/10"
                >
                  <Plus className="w-4 h-4" />
                  {t('addFirstMember')}
                </button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Issue Credential Modal */}
      {showIssueModal && (
        <IssueTeamCredentialModal
          isOpen={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          onSuccess={handleCredentialIssued}
        />
      )}

      {/* View Credential QR Modal */}
      <ViewCredentialQRModal
        isOpen={viewQRCredential !== null}
        onClose={() => setViewQRCredential(null)}
        credential={viewQRCredential}
      />
    </div>
  );
}

// Issue Team Credential Modal (for Partner Admin)
function IssueTeamCredentialModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations('team');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [issuedCredential, setIssuedCredential] = useState<{
    credential: PartnerCredential;
    didcommInvitationUrl?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    holderName: '',
    holderEmail: '',
    role: 'sales' as 'sales' | 'legal',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partners/team/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('issueError'));
      }

      setIssuedCredential({
        credential: data.credential,
        didcommInvitationUrl: data.didcommInvitationUrl,
      });
      setStep('preview');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setIssuedCredential(null);
    setFormData({ holderName: '', holderEmail: '', role: 'sales' });
    setError(null);
    onClose();
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('team-credential-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `credencial-${issuedCredential?.credential.holderName.replace(/\s+/g, '-')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  if (!isOpen) return null;

  const qrValue = issuedCredential?.didcommInvitationUrl || issuedCredential?.credential.qrCode || '';

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md"
        >
          {step === 'form' ? (
            <>
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('addMemberTitle')}</h2>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
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

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t('fullName')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.holderName}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                    placeholder="Maria Garcia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t('email')} *</label>
                  <input
                    type="email"
                    required
                    value={formData.holderEmail}
                    onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                    placeholder="maria@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t('role')} *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as typeof formData.role })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  >
                    <option value="sales">{t('roleSales')}</option>
                    <option value="legal">{t('roleLegal')}</option>
                  </select>
                </div>

                <div className="bg-[var(--color-surface-hover)] rounded-lg p-3 text-sm text-[var(--color-text-secondary)]">
                  {t('credentialInfo')}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)]"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <SovraLoader size="sm" className="!w-4 !h-4 text-white" />
                        {t('issuing')}
                      </>
                    ) : (
                      t('issueCredential')
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('credentialIssued')}</h2>
                </div>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-[var(--color-text-secondary)] text-sm">{t('credentialFor')}</p>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)]">{issuedCredential?.credential.holderName}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{issuedCredential?.credential.holderEmail}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {issuedCredential?.credential.role}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
                    <QRCodeSVG
                      id="team-credential-qr-code"
                      value={qrValue}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center max-w-[280px]">
                    {t('scanQrInfo')}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] flex items-center justify-center gap-2"
                  >
                    {t('downloadQr')}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t('sendByEmail')}
                  </button>
                </div>

                <div className="bg-[var(--color-surface-hover)] rounded-lg p-3 text-sm text-[var(--color-text-secondary)]">
                  <p className="font-medium text-[var(--color-text-primary)] mb-1">{t('userInstructions')}</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>{t('instruction1')}</li>
                    <li>{t('instruction2')}</li>
                    <li>{t('instruction3')}</li>
                  </ol>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// View Credential QR Modal (for viewing/resending pending credentials)
function ViewCredentialQRModal({
  isOpen,
  onClose,
  credential,
}: {
  isOpen: boolean;
  onClose: () => void;
  credential: PartnerCredential | null;
}) {
  const t = useTranslations('team');

  if (!isOpen || !credential) return null;

  const qrValue = credential.qrCode || '';

  const handleDownloadQR = () => {
    const svg = document.getElementById('view-team-credential-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `credencial-${credential.holderName.replace(/\s+/g, '-')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    sales: 'Sales',
    legal: 'Legal',
    admin_secondary: 'Admin Secundario',
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t('pendingCredentialTitle')}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Credential Info */}
            <div className="text-center">
              <p className="text-[var(--color-text-secondary)] text-sm">{t('credentialFor')}</p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">{credential.holderName}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{credential.holderEmail}</p>
              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                {roleLabels[credential.role] || credential.role}
              </span>
            </div>

            {/* QR Code */}
            {qrValue ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
                  <QRCodeSVG
                    id="view-team-credential-qr-code"
                    value={qrValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center max-w-[280px]">
                  {t('scanQrInfo')}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-center">
                {t('qrNotFound')}
              </div>
            )}

            {/* Actions */}
            {qrValue && (
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-hover)] rounded-lg hover:bg-[var(--color-border)] flex items-center justify-center gap-2"
                >
                  {t('downloadQr')}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium !text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t('sendByEmail')}
                </button>
              </div>
            )}

            {/* Info */}
            <div className="bg-[var(--color-surface-hover)] rounded-lg p-3 text-sm text-[var(--color-text-secondary)]">
              <p className="font-medium text-[var(--color-text-primary)] mb-1">{t('userInstructions')}</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>{t('instruction1')}</li>
                <li>{t('instruction2')}</li>
                <li>{t('instruction3')}</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
