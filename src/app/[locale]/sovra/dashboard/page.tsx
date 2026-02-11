import {
  getAllDeals,
  getDealsByStatus,
  getAllPartners,
  getPartnersByStatus,
  getAllAuditLogs,
  getPartnerDeals,
  getAllQuotes,
} from '@/lib/redis/operations';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  Ban,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  BadgeCheck,
  Activity,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import type { Partner, PartnerTier } from '@/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const tierConfig: Record<PartnerTier, { label: string; emoji: string }> = {
  bronze: { label: 'Bronze', emoji: '' },
  silver: { label: 'Silver', emoji: '' },
  gold: { label: 'Gold', emoji: '' },
  platinum: { label: 'Platinum', emoji: '' },
};

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SovraDashboardPage({ params }: PageProps) {
  const { locale } = await params;

  const [
    allDeals,
    pendingDeals,
    approvedDeals,
    rejectedDeals,
    moreInfoDeals,
    allPartners,
    activePartners,
    suspendedPartners,
    recentAuditLogs,
    allQuotes,
  ] = await Promise.all([
    getAllDeals(),
    getDealsByStatus('pending_approval'),
    getDealsByStatus('approved'),
    getDealsByStatus('rejected'),
    getDealsByStatus('more_info'),
    getAllPartners(),
    getPartnersByStatus('active'),
    getPartnersByStatus('suspended'),
    getAllAuditLogs(10),
    getAllQuotes(),
  ]);

  const wonDeals = allDeals.filter(d => d.status === 'won');
  const lostDeals = allDeals.filter(d => d.status === 'lost');
  const negotiationDeals = allDeals.filter(d => d.status === 'negotiation');
  const contractingDeals = allDeals.filter(d => d.status === 'contracting');
  const awardedDeals = allDeals.filter(d => d.status === 'awarded');

  // Calculate partner tier distribution
  const tierCounts = {
    bronze: allPartners.filter(p => p.tier === 'bronze').length,
    silver: allPartners.filter(p => p.tier === 'silver').length,
    gold: allPartners.filter(p => p.tier === 'gold').length,
    platinum: allPartners.filter(p => p.tier === 'platinum').length,
  };

  // Calculate REAL pipeline value from all quotes
  const pipelineValue = allQuotes.reduce((sum, quote) => sum + (quote.total || 0), 0);

  // Calculate pipeline breakdown by deal status
  // Create a map of dealId -> deal for quick lookup
  const dealMap = new Map(allDeals.map(deal => [deal.id, deal]));

  const pipelineByStatus = {
    negotiation: 0,
    contracting: 0,
    awarded: 0,
    won: 0,
  };

  // Sum quotes by deal status
  for (const quote of allQuotes) {
    const deal = dealMap.get(quote.dealId);
    if (deal) {
      if (deal.status === 'negotiation') {
        pipelineByStatus.negotiation += quote.total || 0;
      } else if (deal.status === 'contracting') {
        pipelineByStatus.contracting += quote.total || 0;
      } else if (deal.status === 'awarded') {
        pipelineByStatus.awarded += quote.total || 0;
      } else if (deal.status === 'won') {
        pipelineByStatus.won += quote.total || 0;
      }
    }
  }

  // Calculate top partners by deal count
  const partnerDealCounts = new Map<string, number>();
  for (const deal of allDeals) {
    const count = partnerDealCounts.get(deal.partnerId) || 0;
    partnerDealCounts.set(deal.partnerId, count + 1);
  }

  const topPartners = allPartners
    .map(partner => ({
      ...partner,
      dealCount: partnerDealCounts.get(partner.id) || 0,
      wonCount: allDeals.filter(d => d.partnerId === partner.id && d.status === 'won').length,
    }))
    .sort((a, b) => b.dealCount - a.dealCount)
    .slice(0, 3);

  // Partner stats
  const partnerStats = [
    {
      label: 'Partners Activos',
      value: activePartners.length,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: `/${locale}/sovra/dashboard/partners?status=active`,
    },
    {
      label: 'Suspendidos',
      value: suspendedPartners.length,
      icon: Ban,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      href: `/${locale}/sovra/dashboard/partners?status=suspended`,
    },
    {
      label: 'Total Partners',
      value: allPartners.length,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: `/${locale}/sovra/dashboard/partners`,
    },
    {
      label: 'Tasa Certificacion',
      value: `${allPartners.length > 0 ? Math.round((activePartners.length / allPartners.length) * 100) : 0}%`,
      icon: BadgeCheck,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  // Opportunity stats
  // "Aprobadas" includes: negotiation, contracting, and awarded
  const approvedCount = negotiationDeals.length + contractingDeals.length + awardedDeals.length;

  const dealStats = [
    {
      label: 'Pendientes',
      value: pendingDeals.length,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: `/${locale}/sovra/dashboard/approvals`,
    },
    {
      label: 'Aprobadas',
      value: approvedCount,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Ganadas',
      value: wonDeals.length,
      icon: Trophy,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-primary)]/10',
    },
    {
      label: 'Perdidas',
      value: lostDeals.length,
      icon: XCircle,
      color: 'text-[var(--color-text-secondary)]',
      bgColor: 'bg-[var(--color-surface-hover)]',
    },
  ];

  // Format activity logs for display
  const activityItems = recentAuditLogs.map(log => {
    const actionLabels: Record<string, string> = {
      'partner.created': 'creo un nuevo partner',
      'partner.updated': 'actualizo un partner',
      'partner.suspended': 'suspendio un partner',
      'partner.reactivated': 'reactivo un partner',
      'partner.tier_changed': 'cambio el nivel de un partner',
      'credential.issued': 'emitio una credencial',
      'credential.revoked': 'revoco una credencial',
      'deal.approved': 'aprobo una oportunidad',
      'deal.rejected': 'rechazo una oportunidad',
      'deal.info_requested': 'solicito mas informacion',
      'deal.status_changed': 'cambio el estado de una oportunidad',
      'deal.entered_negotiation': 'oportunidad en negociacion',
      'deal.entered_contracting': 'oportunidad en contratacion',
      'deal.awarded': 'oportunidad adjudicada',
      'deal.won': 'oportunidad ganada',
      'deal.lost': 'oportunidad perdida',
      'document.shared': 'compartio un documento',
      'document.verified': 'verifico un documento',
      'pricing.updated': 'actualizo los precios',
      'course.created': 'creo un curso',
      'course.updated': 'actualizo un curso',
      'course.published': 'publico un curso',
    };

    return {
      id: log.id,
      actorName: log.actorName,
      action: actionLabels[log.action] || log.action,
      entityName: log.entityName,
      timestamp: log.timestamp,
    };
  });

  // Recent deals for quick view
  const recentDeals = allDeals.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          <span className="text-[var(--color-primary)]">Dashboard</span>
        </h1>
        <p className="text-[var(--color-text-secondary)]">Panel de administracion Sovra</p>
      </div>

      {/* Pipeline Section - FIRST */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pipeline Estimado
        </h2>

        {/* Total Pipeline */}
        <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent-purple)]/10 rounded-xl border border-[var(--color-primary)]/20 p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-primary)]/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Total Pipeline</p>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                ${pipelineValue.toLocaleString('en-US')} USD
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Suma de todas las cotizaciones generadas
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">
              ${pipelineByStatus.negotiation.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">En Negociación</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {negotiationDeals.length} oportunidades
            </p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">
              ${pipelineByStatus.contracting.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">En Contratación</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {contractingDeals.length} oportunidades
            </p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">
              ${pipelineByStatus.awarded.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">Adjudicadas</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {awardedDeals.length} oportunidades
            </p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">
              ${pipelineByStatus.won.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">Ganadas</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {wonDeals.length} oportunidades
            </p>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Partners
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partnerStats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
              </div>
            );

            if (stat.href) {
              return (
                <Link key={stat.label} href={stat.href} className="hover:shadow-md transition-shadow rounded-xl">
                  {content}
                </Link>
              );
            }

            return <div key={stat.label}>{content}</div>;
          })}
        </div>

        {/* Tier Distribution */}
        <div className="mt-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">Por Nivel:</p>
          <div className="flex gap-4 flex-wrap">
            {(Object.entries(tierCounts) as [PartnerTier, number][]).map(([tier, count]) => (
              <div key={tier} className="flex items-center gap-2">
                <span className="text-sm">{tierConfig[tier].emoji}</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {tierConfig[tier].label}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunities Section */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Oportunidades
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dealStats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
              </div>
            );

            if (stat.href) {
              return (
                <Link key={stat.label} href={stat.href} className="hover:shadow-md transition-shadow rounded-xl">
                  {content}
                </Link>
              );
            }

            return <div key={stat.label}>{content}</div>;
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {pendingDeals.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <p className="text-amber-500">
                Tienes <strong>{pendingDeals.length}</strong> oportunidades pendientes de aprobacion
              </p>
            </div>
            <Link
              href={`/${locale}/sovra/dashboard/approvals`}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
            >
              Revisar ahora
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Partners */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Top Partners por Oportunidades</h2>
            <Link
              href={`/${locale}/sovra/dashboard/partners`}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {topPartners.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-text-secondary)]">
                No hay partners registrados
              </div>
            ) : (
              topPartners.map((partner, index) => {
                const rankingStyles = [
                  { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '1' },
                  { bg: 'bg-[var(--color-surface-hover)]', text: 'text-[var(--color-text-secondary)]', label: '2' },
                  { bg: 'bg-amber-100', text: 'text-amber-700', label: '3' },
                ];
                const ranking = rankingStyles[index] || { bg: 'bg-[var(--color-primary)]/10', text: 'text-[var(--color-primary)]', label: `${index + 1}` };

                return (
                  <Link
                    key={partner.id}
                    href={`/${locale}/sovra/dashboard/partners/${partner.id}`}
                    className="px-6 py-4 flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full ${ranking.bg} flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${ranking.text}`}>{ranking.label}</span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{partner.companyName || partner.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {partner.country} - {tierConfig[partner.tier].label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--color-text-primary)]">{partner.dealCount}</p>
                      <p className="text-xs text-green-500">{partner.wonCount} ganadas</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Actividad Reciente
            </h2>
            <Link
              href={`/${locale}/sovra/dashboard/audit`}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {activityItems.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-text-secondary)]">
                No hay actividad reciente
              </div>
            ) : (
              activityItems.map((item) => (
                <div key={item.id} className="px-6 py-3">
                  <p className="text-sm text-[var(--color-text-primary)]">
                    <span className="font-medium">{item.actorName}</span>{' '}
                    <span className="text-[var(--color-text-secondary)]">{item.action}</span>
                    {item.entityName && (
                      <>
                        {' '}<span className="font-medium">{item.entityName}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {new Date(item.timestamp).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Oportunidades Recientes</h2>
          <Link
            href={`/${locale}/sovra/dashboard/approvals?status=all`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {recentDeals.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-text-secondary)]">
              No hay oportunidades registradas
            </div>
          ) : (
            recentDeals.map((deal) => (
              <div key={deal.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{deal.clientName}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {deal.country} - {deal.governmentLevel}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {new Date(deal.createdAt).toLocaleDateString('es')}
                  </span>
                  <StatusBadge status={deal.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    // Estados pre-aprobación
    pending_approval: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-500' },
    approved: { label: 'Aprobada', className: 'bg-green-500/10 text-green-500' },
    rejected: { label: 'Rechazada', className: 'bg-red-500/10 text-red-500' },
    more_info: { label: 'Mas Info', className: 'bg-orange-500/10 text-orange-500' },
    // Estados post-cotización
    negotiation: { label: 'Negociacion', className: 'bg-blue-500/10 text-blue-500' },
    contracting: { label: 'Contratacion', className: 'bg-indigo-500/10 text-indigo-500' },
    awarded: { label: 'Adjudicada', className: 'bg-purple-500/10 text-purple-500' },
    won: { label: 'Ganada', className: 'bg-emerald-500/10 text-emerald-500' },
    lost: { label: 'Perdida', className: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]' };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
