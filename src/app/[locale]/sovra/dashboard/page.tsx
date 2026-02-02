import { getAllDeals, getDealsByStatus } from '@/lib/redis/operations';
import { Clock, CheckCircle, XCircle, AlertCircle, Trophy, Ban } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SovraDashboardPage({ params }: PageProps) {
  const { locale } = await params;

  const [allDeals, pendingDeals, approvedDeals, rejectedDeals, moreInfoDeals] = await Promise.all([
    getAllDeals(),
    getDealsByStatus('pending_approval'),
    getDealsByStatus('approved'),
    getDealsByStatus('rejected'),
    getDealsByStatus('more_info'),
  ]);

  const closedWonDeals = allDeals.filter(d => d.status === 'closed_won');
  const closedLostDeals = allDeals.filter(d => d.status === 'closed_lost');

  const stats = [
    {
      label: 'Pendientes de Aprobacion',
      value: pendingDeals.length,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      href: `/${locale}/sovra/dashboard/approvals`,
    },
    {
      label: 'Aprobadas',
      value: approvedDeals.length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Rechazadas',
      value: rejectedDeals.length,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Esperando Info',
      value: moreInfoDeals.length,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Cerradas Ganadas',
      value: closedWonDeals.length,
      icon: Trophy,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-primary)]/10',
    },
    {
      label: 'Cerradas Perdidas',
      value: closedLostDeals.length,
      icon: Ban,
      color: 'text-[var(--color-text-secondary)]',
      bgColor: 'bg-[var(--color-surface-hover)]',
    },
  ];

  // Recent deals for quick view
  const recentDeals = allDeals.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          <span className="text-[var(--color-primary)]">Dashboard</span>
        </h1>
        <p className="text-[var(--color-text-secondary)]">Vista general del sistema de oportunidades</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
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

      {/* Recent Deals */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Oportunidades Recientes</h2>
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
    pending_approval: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-500' },
    approved: { label: 'Aprobada', className: 'bg-green-500/10 text-green-500' },
    rejected: { label: 'Rechazada', className: 'bg-red-500/10 text-red-500' },
    more_info: { label: 'Mas Info', className: 'bg-orange-500/10 text-orange-500' },
    closed_won: { label: 'Ganada', className: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' },
    closed_lost: { label: 'Perdida', className: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]' };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
