'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'destructive' | 'primary';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-amber-500/10 text-amber-500',
    danger: 'bg-red-500/10 text-red-500',
    info: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    secondary: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]',
    outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)]',
    destructive: 'bg-red-500/10 text-red-500',
    primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
