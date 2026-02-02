'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from './RoleSwitcher';
import type { Partner, User, UserRole } from '@/types';

interface PortalShellProps {
  children: React.ReactNode;
  partner: Partner;
  user: User;
  locale: string;
}

export function PortalShell({ children, partner, user, locale }: PortalShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/partners/auth/logout', { method: 'POST' });
    router.push(`/${locale}/partners/login`);
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <Sidebar
        partner={partner}
        user={user}
        locale={locale}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--color-text-primary)]">Sovra</span>
            <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
              Partners
            </span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Demo Role Switcher */}
      <RoleSwitcher currentRole={user.role as UserRole} />
    </div>
  );
}
