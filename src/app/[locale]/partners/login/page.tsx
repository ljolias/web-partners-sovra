'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { Alert } from '@/components/ui';

const languages = [
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Portugues', flag: '🇧🇷' },
];

function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <div className="absolute top-6 right-6">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all"
        >
          <Globe className="h-4 w-4" />
          <span>{currentLang.flag}</span>
          <span>{currentLang.name}</span>
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
              className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/5 bg-[#0f0d1a] py-2 shadow-2xl"
            >
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`/${lang.code}/partners/login`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    lang.code === currentLocale
                      ? 'bg-[#0099ff]/10 text-[#0099ff] font-medium'
                      : 'text-[#888888] hover:bg-white/5 hover:text-white'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background - Sovra Brand Colors */}
      <div className="absolute inset-0 bg-[#0a0915]">
        {/* Gradient mesh - Sovra style */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 40% 20%, rgba(0, 153, 255, 0.15) 0px, transparent 50%),
              radial-gradient(at 80% 80%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
              radial-gradient(at 10% 90%, rgba(34, 197, 94, 0.08) 0px, transparent 50%)
            `
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <LanguageSelector currentLocale={locale} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href={`/${locale}`} className="inline-block">
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Sovra
            </motion.h1>
          </Link>
          <motion.p
            className="mt-3 text-white/50 text-sm tracking-wide uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Partner Portal
          </motion.p>
        </div>

        {/* Card - Sovra Surface Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 bg-[#0f0d1a] p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white">{tLogin('subtitle')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-white placeholder-[#444444] outline-none transition-all focus:border-[#0099ff]/50 focus:ring-2 focus:ring-[#0099ff]/20"
                placeholder="partner@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-white placeholder-[#444444] outline-none transition-all focus:border-[#0099ff]/50 focus:ring-2 focus:ring-[#0099ff]/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-[#0099ff] px-6 py-3.5 text-sm font-semibold !text-white shadow-lg shadow-[#0099ff]/20 transition-all hover:bg-[#0099ff]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
          className="mt-8 text-center text-sm text-white/30"
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

  // We need to load messages client-side for this page
  // since it's outside the portal layout
  return <LoginPageWithMessages locale={locale} />;
}

function LoginPageWithMessages({ locale }: { locale: string }) {
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  // Load messages on mount
  if (!messages) {
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default));
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LoginForm locale={locale} />
    </NextIntlClientProvider>
  );
}
