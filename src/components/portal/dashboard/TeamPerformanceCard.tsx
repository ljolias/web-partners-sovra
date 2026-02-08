import { Users, Briefcase, DollarSign, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { TeamPerformance } from '@/lib/redis/operations/teamAnalytics';

interface TeamPerformanceCardProps {
  performance: TeamPerformance;
}

export function TeamPerformanceCard({ performance }: TeamPerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Desempeño del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Team Size */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Equipo
              </p>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {performance.teamSize}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {performance.certifiedMembers} certificados
            </p>
          </div>

          {/* Total Deals */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Oportunidades
              </p>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {performance.totalDeals}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {performance.activeDeals} activas
            </p>
          </div>

          {/* Won Deals */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Ganadas
              </p>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {performance.wonDeals}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {performance.lostDeals} perdidas
            </p>
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Revenue Total
              </p>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {formatCurrency(performance.totalRevenue)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              del equipo
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {performance.totalCertifications}
              </p>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Certificaciones Totales
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {performance.totalAchievements}
              </p>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Logros del Equipo
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
