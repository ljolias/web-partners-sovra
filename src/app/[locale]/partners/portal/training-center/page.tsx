'use client';

import { use } from 'react';
import { TrainingCenterView } from '@/components/portal/training/TrainingCenterView';

interface TrainingCenterPageProps {
  params: Promise<{ locale: string }>;
}

export default function TrainingCenterPage({ params }: TrainingCenterPageProps) {
  const { locale } = use(params);

  return <TrainingCenterView locale={locale} />;
}
