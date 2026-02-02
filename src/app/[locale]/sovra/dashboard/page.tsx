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
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: `/${locale}/sovra/dashboard/approvals`,
    },
    {
      label: 'Aprobadas',
      value: approvedDeals.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Rechazadas',
      value: rejectedDeals.length,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Esperando Info',
      value: moreInfoDeals.length,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Cerradas Ganadas',
      value: closedWonDeals.length,
      icon: Trophy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Cerradas Perdidas',
      value: closedLostDeals.length,
      icon: Ban,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  // Recent deals for quick view
  const recentDeals = allDeals.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Vista general del sistema de oportunidades</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                Tienes <strong>{pendingDeals.length}</strong> oportunidades pendientes de aprobacion
              </p>
            </div>
            <Link
              href={`/${locale}/sovra/dashboard/approvals`}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
            >
              Revisar ahora
            </Link>
          </div>
        </div>
      )}

      {/* Recent Deals */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Oportunidades Recientes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentDeals.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay oportunidades registradas
            </div>
          ) : (
            recentDeals.map((deal) => (
              <div key={deal.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{deal.clientName}</p>
                  <p className="text-sm text-gray-500">
                    {deal.country} - {deal.governmentLevel}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
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
    pending_approval: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Aprobada', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
    more_info: { label: 'Mas Info', className: 'bg-orange-100 text-orange-800' },
    closed_won: { label: 'Ganada', className: 'bg-blue-100 text-blue-800' },
    closed_lost: { label: 'Perdida', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
