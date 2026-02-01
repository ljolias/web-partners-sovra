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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Partner, User } from '@/types';

interface SidebarProps {
  partner: Partner;
  user: User;
  locale: string;
  onLogout: () => void;
}

const languages = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇺🇸' },
  { code: 'pt', flag: '🇧🇷' },
];

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

  const tierBgColors = {
    bronze: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    silver: 'bg-gray-400/10 text-gray-300 border-gray-400/20',
    gold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    platinum: 'bg-slate-300/10 text-slate-300 border-slate-300/20',
  };

  // Get current path without locale to switch languages
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  return (
    <aside className="flex h-screen w-72 flex-col bg-[#0f0d1a] border-r border-white/5">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
        <Link href={basePath} className="flex items-center gap-3">
          {/* Sovra Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0099ff] to-[#2060df]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Sovra</span>
            <span className="text-xs font-medium text-[#0099ff] bg-[#0099ff]/10 px-2 py-0.5 rounded-full border border-[#0099ff]/20">
              Partners
            </span>
          </div>
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="px-6 py-3 border-b border-white/5">
        <div className="flex gap-1">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}${pathWithoutLocale}`}
              className={cn(
                'text-sm px-3 py-1.5 rounded-lg transition-all',
                locale === lang.code
                  ? 'bg-[#0099ff]/10 text-[#0099ff]'
                  : 'text-[#888888] hover:text-white hover:bg-white/5'
              )}
            >
              {lang.flag}
            </Link>
          ))}
        </div>
      </div>

      {/* Partner Info */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0099ff] to-[#8b5cf6] text-white font-bold text-lg shadow-lg shadow-[#0099ff]/20">
            {partner.companyName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white">{partner.companyName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  tierBgColors[partner.tier]
                )}
              >
                {tTier(partner.tier)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#0099ff]/10 text-white'
                      : 'text-[#888888] hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#0099ff] to-[#8b5cf6] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn('h-5 w-5', isActive && 'text-[#0099ff]')} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#888888] text-sm font-medium border border-white/5">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-[#888888]">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-[#888888] hover:bg-white/5 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
