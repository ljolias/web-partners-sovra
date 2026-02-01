'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  DollarSign,
  LogOut,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Partner, User } from '@/types';
import { useState, useEffect } from 'react';

interface SidebarProps {
  partner: Partner;
  user: User;
  locale: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const languages = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇺🇸' },
  { code: 'pt', flag: '🇧🇷' },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sovra-partners-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(saved);
    }
  }, []);

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('sovra-partners-theme', newTheme);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Sidebar({ partner, user, locale, onLogout, isOpen = true, onClose }: SidebarProps) {
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
    bronze: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    silver: 'bg-gray-400/10 text-gray-600 dark:text-gray-300 border-gray-400/20',
    gold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    platinum: 'bg-slate-300/10 text-slate-600 dark:text-slate-300 border-slate-300/20',
  };

  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b border-[var(--color-border)]">
        <Link href={basePath} className="flex items-center gap-2 lg:gap-3" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg lg:text-xl font-bold text-[var(--color-text-primary)]">Sovra</span>
            <span className="hidden sm:inline text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">
              Partners
            </span>
          </div>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Theme & Language */}
      <div className="px-4 lg:px-6 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex gap-1">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}${pathWithoutLocale}`}
              onClick={onClose}
              className={cn(
                'text-sm px-2 lg:px-3 py-1.5 rounded-lg transition-all',
                locale === lang.code
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
              )}
            >
              {lang.flag}
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </div>

      {/* Partner Info */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 lg:h-11 w-10 lg:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-purple)] text-white font-bold text-base lg:text-lg shadow-lg shadow-[var(--color-primary)]/20">
            {partner.companyName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{partner.companyName}</p>
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
      <nav className="flex-1 overflow-y-auto p-2 lg:p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 lg:h-8 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent-purple)] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn('h-5 w-5', isActive && 'text-[var(--color-primary)]')} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-[var(--color-border)] p-3 lg:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 lg:h-10 w-9 lg:w-10 items-center justify-center rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] text-sm font-medium border border-[var(--color-border)]">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-72 flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] z-50"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
