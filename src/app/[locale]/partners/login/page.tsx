'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Sun, Moon } from 'lucide-react';
import { SovraLogo } from '@/components/ui/SovraLogo';
import { SovraLoader } from '@/components/ui';

const languages = [
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Portugues', flag: '🇧🇷' },
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
      className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 shadow-2xl"
          >
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={`/${lang.code}/partners/login`}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  lang.code === currentLocale
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </Link>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const t = useTranslations('auth');
  const tLogin = useTranslations('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/partners/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push(`/${locale}/partners/portal`);
      } else {
        setError(t('loginError'));
      }
    } catch {
      setError(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-bg)]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="dark:gradient-mesh-dark light:gradient-mesh-light absolute inset-0 gradient-mesh-dark" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      {/* Header */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelector currentLocale={locale} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4 sm:px-6 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-10">
          <Link href={`/${locale}`} className="inline-flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SovraLogo size="xl" />
            </motion.div>
          </Link>
          <motion.p
            className="mt-2 sm:mt-3 text-[var(--color-text-secondary)] text-xs sm:text-sm tracking-wide uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Partner Portal
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-2xl"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">{tLogin('subtitle')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-neutral-dark)] outline-none transition-all focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="demo@sovra.io"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-neutral-dark)] outline-none transition-all focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-[var(--color-primary)] px-6 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <SovraLoader size="sm" className="!w-5 !h-5 text-white" />
                ) : (
                  <>
                    {t('login')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[var(--color-text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          © {new Date().getFullYear()} Sovra. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = use(params);

  return <LoginPageWithMessages locale={locale} />;
}

function LoginPageWithMessages({ locale }: { locale: string }) {
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default));
  }, [locale]);

  if (!messages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <SovraLoader size="md" className="text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LoginForm locale={locale} />
    </NextIntlClientProvider>
  );
}
