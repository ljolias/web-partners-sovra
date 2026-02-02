'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface RoleSwitcherProps {
  currentRole: UserRole;
}

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'sales', label: 'Sales', description: 'Deals and Training Center' },
];

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const t = useTranslations('demo');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in demo mode or development
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.NODE_ENV === 'development';

  if (!isDemoMode) {
    return null;
  }

  const handleRoleSwitch = async (newRole: UserRole) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/partners/demo/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        // Refresh the page to reflect role changes
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg',
            'bg-gradient-to-r from-purple-600 to-indigo-600',
            'text-white font-medium text-sm',
            'hover:from-purple-700 hover:to-indigo-700',
            'transition-all duration-200',
            'border border-white/20',
            isLoading && 'opacity-70 cursor-not-allowed'
          )}
        >
          <Shield className="h-4 w-4" />
          <span>{t('currentRole', { role: currentRole })}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 w-64 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden"
            >
              <div className="p-2 border-b border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] px-2">
                  {t('switchRole')}
                </p>
              </div>
              <div className="p-1">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSwitch(role.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                      'transition-colors duration-150',
                      currentRole === role.value
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{role.label}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {role.description}
                      </p>
                    </div>
                    {currentRole === role.value && (
                      <Check className="h-4 w-4 text-[var(--color-primary)]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-[var(--color-border)] bg-amber-50 dark:bg-amber-900/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 px-2">
                  Demo mode only
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
