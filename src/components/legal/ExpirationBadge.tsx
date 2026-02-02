'use client';

import { AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ExpirationBadgeProps {
  expirationDate: string;
  locale: string;
  className?: string;
}

export function ExpirationBadge({ expirationDate, locale, className }: ExpirationBadgeProps) {
  const now = new Date();
  const expDate = new Date(expirationDate);
  const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = () => {
    return expDate.toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'pt' ? 'pt-BR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (daysUntilExpiry < 0) {
    // Expired
    return (
      <Badge variant="destructive" className={cn('flex items-center gap-1', className)}>
        <AlertTriangle className="h-3 w-3" />
        Expired {formatDate()}
      </Badge>
    );
  }

  if (daysUntilExpiry <= 7) {
    // Expiring very soon
    return (
      <Badge variant="destructive" className={cn('flex items-center gap-1', className)}>
        <AlertTriangle className="h-3 w-3" />
        Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
      </Badge>
    );
  }

  if (daysUntilExpiry <= 30) {
    // Expiring soon
    return (
      <Badge variant="warning" className={cn('flex items-center gap-1', className)}>
        <Clock className="h-3 w-3" />
        Expires in {daysUntilExpiry} days
      </Badge>
    );
  }

  // Not expiring soon
  return (
    <Badge variant="secondary" className={cn('flex items-center gap-1', className)}>
      <Clock className="h-3 w-3" />
      Valid until {formatDate()}
    </Badge>
  );
}
