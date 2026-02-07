'use client';

import dynamic from 'next/dynamic';
import { SovraLoader } from '@/components/ui';
import type { Deal, Partner, PricingConfig } from '@/types';

// Lazy load QuoteBuilder - it's a heavy component with complex calculations
const QuoteBuilder = dynamic(
  () => import('./QuoteBuilder').then(mod => ({ default: mod.QuoteBuilder })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <SovraLoader size="lg" />
      </div>
    ),
    ssr: false, // Quote builder doesn't need SSR
  }
);

interface QuoteBuilderWrapperProps {
  deal: Deal;
  partner: Partner;
  pricingConfig: PricingConfig;
  locale: string;
}

export function QuoteBuilderWrapper({
  deal,
  partner,
  pricingConfig,
  locale,
}: QuoteBuilderWrapperProps) {
  return (
    <QuoteBuilder
      deal={deal}
      partner={partner}
      pricingConfig={pricingConfig}
      locale={locale}
    />
  );
}
