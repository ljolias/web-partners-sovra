'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Award, Briefcase, GraduationCap, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, Badge, Progress } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { TeamMemberSummary, UserRole } from '@/types';

interface TeamMemberCardProps {
  member: TeamMemberSummary;
  index: number;
}

export function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  const t = useTranslations('team');
  const tCert = useTranslations('certifications');

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    sales: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card>
        <CardContent className="pt-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-purple)] text-white font-bold text-lg shadow-lg shadow-[var(--color-primary)]/20">
              {member.user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  {member.user.name}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[member.user.role as UserRole]}`}
                >
                  {member.user.role}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">{member.user.email}</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">{t('totalDeals')}</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{member.metrics.totalDeals}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">{t('wonDeals')}</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{member.metrics.wonDeals}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">{t('activeDeals')}</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{member.metrics.activeDeals}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">{t('revenue')}</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(member.metrics.totalRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Training Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">{t('training')}</span>
              </div>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {member.metrics.trainingCompletionRate}%
              </span>
            </div>
            <Progress value={member.metrics.trainingCompletionRate} />
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">{t('certifications')}</span>
            </div>
            {member.metrics.activeCertificationsCount > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.certifications
                  .filter((c) => c.status === 'active' && new Date(c.expiresAt) > new Date())
                  .map((cert) => (
                    <Badge key={cert.id} variant="success">
                      {tCert(`types.${cert.type}`)}
                    </Badge>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">{t('noCertifications')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
