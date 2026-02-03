'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SovraLoader } from './SovraLoader';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-[var(--color-primary)] !text-white hover:opacity-90 focus:ring-[var(--color-primary)]',
      secondary: 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-hover)] focus:ring-[var(--color-primary)]',
      outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] focus:ring-[var(--color-primary)]',
      ghost: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] focus:ring-[var(--color-primary)]',
      danger: 'bg-red-600 !text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <>
            <SovraLoader size="sm" className="mr-2 !w-4 !h-4" />
            Loading...
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
