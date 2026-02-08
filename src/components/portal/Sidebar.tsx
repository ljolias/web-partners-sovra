'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  FileText,
  LogOut,
  Sun,
  Moon,
  X,
  Users,
  Globe,
  ChevronDown,
  Trophy,
  User as UserIcon,
  Menu,
} from 'lucide-react';
import { hasPermission, type Permission } from '@/lib/permissions';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { SovraLogo } from '@/components/ui/SovraLogo';
import type { Partner, User } from '@/types';
import { useState, useEffect, useRef } from 'react';

import { logger } from '@/lib/logger';
interface SidebarProps {
  partner: Partner;
  user: User;
  locale: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const languages = [
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
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

function LanguageDropdown({ locale, pathWithoutLocale, onSelect }: { locale: string; pathWithoutLocale: string; onSelect?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm">{currentLang.flag}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={`/${lang.code}${pathWithoutLocale}`}
                onClick={() => {
                  setIsOpen(false);
                  onSelect?.();
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                  locale === lang.code
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ partner, user, locale, onLogout, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tTier = useTranslations('tier');
  const [pendingDocsCount, setPendingDocsCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sovra-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Toggle collapsed state
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sovra-sidebar-collapsed', String(newState));
  };

  const basePath = `/${locale}/partners/portal`;
  const userRole = user.role as UserRole;

  // Fetch pending documents count
  useEffect(() => {
    async function fetchPendingDocs() {
      try {
        const res = await fetch('/api/partners/legal');
        if (res.ok) {
          const data = await res.json();
          const documents = data.documents || [];
          const pendingCount = documents.filter(
            (doc: { status: string }) =>
              doc.status === 'pending_signature' || doc.status === 'partially_signed'
          ).length;
          setPendingDocsCount(pendingCount);
        }
      } catch (error) {
        logger.error('Failed to fetch pending docs:', { error: error });
      }
    }

    if (hasPermission(userRole, 'legal:view')) {
      fetchPendingDocs();
    }
  }, [userRole]);

  const allNavItems = [
    { href: basePath, icon: LayoutDashboard, label: t('dashboard'), permission: null, badge: 0 },
    { href: `${basePath}/deals`, icon: Briefcase, label: t('deals'), permission: 'deals:view' as Permission, badge: 0 },
    { href: `${basePath}/training-center`, icon: GraduationCap, label: t('trainingCenter'), permission: 'training:view' as Permission, badge: 0 },
    { href: `${basePath}/legal`, icon: FileText, label: t('legal'), permission: 'legal:view' as Permission, badge: pendingDocsCount },
    { href: `${basePath}/rewards`, icon: Trophy, label: t('rewards'), permission: null, badge: 0 },
    { href: `${basePath}/team`, icon: Users, label: t('team'), permission: 'team:view' as Permission, badge: 0 },
    { href: `${basePath}/profile`, icon: UserIcon, label: t('profile'), permission: null, badge: 0 },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(userRole, item.permission);
  });

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
      <div className={cn(
        'flex border-b border-[var(--color-border)] transition-all',
        isCollapsed ? 'h-auto flex-col items-center py-3 gap-2' : 'h-16 items-center justify-between px-4 lg:px-6'
      )}>
        {isCollapsed ? (
          <>
            {/* Toggle button for desktop - collapsed state */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:block p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Expandir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Isologo only */}
            <Link href={basePath} className="flex items-center" onClick={onClose}>
              <SovraLogo size="md" showText={false} />
            </Link>
          </>
        ) : (
          <>
            <Link href={basePath} className="flex items-center gap-2 lg:gap-3" onClick={onClose}>
              <SovraLogo size="md" showText={true} />
              <span className="hidden sm:inline text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                Partners
              </span>
            </Link>

            {/* Toggle button for desktop - expanded state */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:block p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Contraer menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Theme & Language */}
      {!isCollapsed && (
        <div className="px-4 lg:px-6 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <LanguageDropdown
            locale={locale}
            pathWithoutLocale={pathWithoutLocale}
            onSelect={onClose}
          />
          <ThemeToggle />
        </div>
      )}

      {/* Partner Info */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="flex h-10 lg:h-11 w-10 lg:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-purple)] text-white font-bold text-base lg:text-lg shadow-lg shadow-[var(--color-primary)]/20">
            {partner.companyName.charAt(0)}
          </div>
          {!isCollapsed && (
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
          )}
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
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
                    isCollapsed && 'justify-center'
                  )}
                >
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 lg:h-8 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent-purple)] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn('h-5 w-5', isActive && 'text-[var(--color-primary)]')} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">
                      {item.badge > 9 ? '9' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-[var(--color-border)] p-3 lg:p-4">
        <div className={cn('flex items-center gap-3', isCollapsed && 'flex-col')}>
          <div className="flex h-9 lg:h-10 w-9 lg:w-10 items-center justify-center rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] text-sm font-medium border border-[var(--color-border)] overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          {!isCollapsed && (
            <>
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
            </>
          )}
          {isCollapsed && (
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex h-screen flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-72'
      )}>
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
