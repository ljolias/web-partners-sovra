'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  DollarSign,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Partner, User } from '@/types';

interface SidebarProps {
  partner: Partner;
  user: User;
  locale: string;
  onLogout: () => void;
}

export function Sidebar({ partner, user, locale, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tTier = useTranslations('tier');

  const basePath = `/${locale}/partners/portal`;

  const navItems = [
    { href: basePath, icon: LayoutDashboard, label: t('dashboard') },
    { href: `${basePath}/deals`, icon: Briefcase, label: t('deals') },
    { href: `${basePath}/training`, icon: GraduationCap, label: t('training') },
    { href: `${basePath}/certifications`, icon: Award, label: t('certifications') },
    { href: `${basePath}/legal`, icon: FileText, label: t('legal') },
    { href: `${basePath}/commissions`, icon: DollarSign, label: t('commissions') },
  ];

  const tierColors = {
    bronze: 'bg-amber-700',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-slate-300',
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href={basePath} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            S
          </div>
          <span className="text-lg font-semibold text-gray-900">Sovra Partners</span>
        </Link>
      </div>

      {/* Partner Info */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
            {partner.companyName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{partner.companyName}</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-2 w-2 rounded-full',
                  tierColors[partner.tier]
                )}
              />
              <span className="text-xs text-gray-500">{tTier(partner.tier)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="h-1.5 w-1.5 rounded-full bg-indigo-600"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-sm font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
