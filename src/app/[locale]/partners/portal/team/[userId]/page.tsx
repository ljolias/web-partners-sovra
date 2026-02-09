'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Award,
  GraduationCap,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { SovraLoader, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import type { User, Deal, Certification } from '@/types';
import { formatDate } from '@/lib/utils';

interface TeamMemberPageProps {
  params: Promise<{ locale: string; userId: string }>;
}

interface TeamMemberData {
  user: User;
  deals: Deal[];
  certifications: Certification[];
  stats: {
    totalDeals: number;
    pendingDeals: number;
    approvedDeals: number;
    wonDeals: number;
    lostDeals: number;
    rejectedDeals: number;
    totalCertifications: number;
    activeCertifications: number;
  };
}

const dealStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  // Estados pre-aprobación
  pending_approval: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-100 border-yellow-200', icon: Clock },
  approved: { label: 'Aprobada', color: 'text-green-600 bg-green-100 border-green-200', icon: CheckCircle },
  more_info: { label: 'Info Requerida', color: 'text-orange-600 bg-orange-100 border-orange-200', icon: AlertCircle },
  rejected: { label: 'Rechazada', color: 'text-red-600 bg-red-100 border-red-200', icon: XCircle },
  // Estados post-cotización
  negotiation: { label: 'Negociacion', color: 'text-blue-600 bg-blue-100 border-blue-200', icon: Clock },
  contracting: { label: 'Contratacion', color: 'text-indigo-600 bg-indigo-100 border-indigo-200', icon: Clock },
  awarded: { label: 'Adjudicada', color: 'text-purple-600 bg-purple-100 border-purple-200', icon: CheckCircle },
  won: { label: 'Ganada', color: 'text-emerald-600 bg-emerald-100 border-emerald-200', icon: TrendingUp },
  lost: { label: 'Perdida', color: 'text-gray-600 bg-gray-100 border-gray-200', icon: XCircle },
};

export default function TeamMemberDetailPage({ params }: TeamMemberPageProps) {
  const { locale, userId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<TeamMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/partners/team/${userId}`);
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('No tienes permiso para ver esta información');
          }
          throw new Error('Error al cargar datos del miembro');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href={`/${locale}/partners/portal/team`}
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al equipo
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error || 'Usuario no encontrado'}</p>
        </div>
      </div>
    );
  }

  const { user, deals, certifications, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/partners/portal/team`}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="capitalize">{user.role}</Badge>
                <span className="text-sm text-[var(--color-text-secondary)]">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalDeals}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Total Oportunidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.wonDeals}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Ganadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingDeals}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.activeCertifications}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Certificaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              Certificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">
                No tiene certificaciones aún
              </p>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 ${cert.status === 'active' ? 'text-amber-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {cert.type === 'sales_fundamentals' && 'Fundamentos de Ventas'}
                          {cert.type === 'technical_specialist' && 'Especialista Técnico'}
                          {cert.type === 'solution_architect' && 'Arquitecto de Soluciones'}
                        </p>
                        {cert.issuedAt && (
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {formatDate(cert.issuedAt, locale)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={cert.status === 'active' ? 'success' : 'secondary'}>
                      {cert.status === 'active' ? 'Activa' : cert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" />
              Información
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[var(--color-text-secondary)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Email</p>
                  <p className="text-sm text-[var(--color-text-primary)]">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--color-text-secondary)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Teléfono</p>
                    <p className="text-sm text-[var(--color-text-primary)]">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.country && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--color-text-secondary)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">País</p>
                    <p className="text-sm text-[var(--color-text-primary)]">{user.country}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--color-text-secondary)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Miembro desde</p>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {formatDate(user.createdAt, locale)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            Oportunidades Registradas ({deals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">
              No ha registrado oportunidades aún
            </p>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => {
                const statusCfg = dealStatusConfig[deal.status] || dealStatusConfig.pending_approval;
                const StatusIcon = statusCfg.icon;

                return (
                  <Link
                    key={deal.id}
                    href={`/${locale}/partners/portal/deals/${deal.id}`}
                    className="block p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                          {deal.clientName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                          <span>{deal.country}</span>
                          <span>•</span>
                          <span className="capitalize">{deal.governmentLevel}</span>
                          <span>•</span>
                          <span>{formatDate(deal.createdAt, locale)}</span>
                        </div>
                      </div>
                      <Badge className={statusCfg.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
