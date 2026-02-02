'use client';

import { use } from 'react';
import { TeamDashboard } from '@/components/portal/team/TeamDashboard';

interface TeamPageProps {
  params: Promise<{ locale: string }>;
}

export default function TeamPage({ params }: TeamPageProps) {
  const { locale } = use(params);

  return <TeamDashboard locale={locale} />;
}
