'use client';

import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import type { Partner, User } from '@/types';

interface PortalShellProps {
  children: React.ReactNode;
  partner: Partner;
  user: User;
  locale: string;
}

export function PortalShell({ children, partner, user, locale }: PortalShellProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/partners/auth/logout', { method: 'POST' });
    router.push(`/${locale}/partners/login`);
  };

  return (
    <div className="flex h-screen bg-[#0a0915]">
      <Sidebar partner={partner} user={user} locale={locale} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
