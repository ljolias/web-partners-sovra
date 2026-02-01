'use client';

import { type HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      content: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      content: 'text-green-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      content: 'text-yellow-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      content: 'text-red-700',
    },
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
  };

  const Icon = icons[variant];
  const styles = variants[variant];

  return (
    <div
      className={cn('flex gap-3 rounded-lg border p-4', styles.container, className)}
      role="alert"
      {...props}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', styles.icon)} />
      <div>
        {title && <h4 className={cn('font-medium', styles.title)}>{title}</h4>}
        <div className={cn('text-sm', styles.content, title && 'mt-1')}>{children}</div>
      </div>
    </div>
  );
}

export { Alert };
