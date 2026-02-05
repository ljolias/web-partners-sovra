'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Users,
  FileText,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  GraduationCap,
  Activity,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SovraLogo } from '@/components/ui/SovraLogo';
import { RoleSwitcher } from '@/components/portal/RoleSwitcher';
import type { User } from '@/types';

interface SovraShellProps {
  user: User;
  children: React.ReactNode;
  locale: string;
}

const languages = [
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
];

const navigation = [
  { name: 'Dashboard', href: '/sovra/dashboard', icon: LayoutDashboard },
  { name: 'Partners', href: '/sovra/dashboard/partners', icon: Users },
  { name: 'Aprobar Oportunidades', href: '/sovra/dashboard/approvals', icon: FileCheck },
  { name: 'Documentos Legales', href: '/sovra/dashboard/documents', icon: FileText },
  { name: 'Training Center', href: '/sovra/dashboard/training', icon: GraduationCap },
  { name: 'Configurar Precios', href: '/sovra/dashboard/pricing', icon: DollarSign },
  { name: 'Gestión de recompensas', href: '/sovra/dashboard/rewards', icon: Trophy },
  { name: 'Audit Log', href: '/sovra/dashboard/audit', icon: Activity },
  { name: 'Configuracion', href: '/sovra/dashboard/settings', icon: Settings },
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

export default function SovraShell({ user, children, locale }: SovraShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const basePath = `/${locale}/sovra/dashboard`;
  const pathWithoutLocale = pathname.replace(`/${locale}`, '');

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(fullPath + '/');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b border-[var(--color-border)]">
        <Link href={basePath} className="flex items-center gap-2 lg:gap-3" onClick={() => setSidebarOpen(false)}>
          <SovraLogo size="md" />
          <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Theme & Language */}
      <div className="px-4 lg:px-6 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <LanguageDropdown
          locale={locale}
          pathWithoutLocale={pathWithoutLocale}
          onSelect={() => setSidebarOpen(false)}
        />
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 lg:p-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={`/${locale}${item.href}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium transition-all',
                    active
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sovra-sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 lg:h-8 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent-purple)] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('h-5 w-5', active && 'text-[var(--color-primary)]')} />
                  <span className="flex-1">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-[var(--color-border)] p-3 lg:p-4">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 lg:h-10 w-9 lg:w-10 rounded-xl"
            />
          ) : (
            <div className="flex h-9 lg:h-10 w-9 lg:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-purple)] text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
          <form action="/api/partners/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Cerrar sesion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-72 flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
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

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar for mobile */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center h-16 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Role Switcher for demo */}
      <RoleSwitcher currentRole={user.role} locale={locale} />
    </div>
  );
}
