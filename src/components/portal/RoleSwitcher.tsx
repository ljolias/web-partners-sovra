'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, Check, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  locale?: string;
}

const roles: { value: UserRole; label: string; description: string; portal: 'partner' | 'sovra' }[] = [
  { value: 'admin', label: 'Partner Admin', description: 'Full partner portal access', portal: 'partner' },
  { value: 'sales', label: 'Partner Sales', description: 'Deals and Training Center', portal: 'partner' },
  { value: 'sovra_admin', label: 'Sovra Admin', description: 'Internal admin dashboard', portal: 'sovra' },
];

export function RoleSwitcher({ currentRole, locale = 'es' }: RoleSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        // Redirect to the appropriate portal based on role
        const selectedRole = roles.find(r => r.value === newRole);
        if (selectedRole?.portal === 'sovra') {
          window.location.href = `/${locale}/sovra/dashboard`;
        } else {
          window.location.href = `/${locale}/partners/portal`;
        }
      }
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const isSovraAdmin = currentRole === 'sovra_admin';
  const currentRoleInfo = roles.find(r => r.value === currentRole);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg',
            'text-white font-medium text-sm',
            'transition-all duration-200',
            'border border-white/20',
            isSovraAdmin
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
            isLoading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isSovraAdmin ? <Building2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          <span>{currentRoleInfo?.label || currentRole}</span>
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
                  Cambiar vista (Demo)
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
