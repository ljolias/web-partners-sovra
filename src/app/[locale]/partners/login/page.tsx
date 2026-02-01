'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Button, Input, Alert, Card } from '@/components/ui';

const languages = [
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Portugues', flag: '🇧🇷' },
];

function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <div className="absolute top-4 right-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Globe className="h-4 w-4 text-gray-500" />
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
              className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            >
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`/${lang.code}/partners/login`}
                  className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    lang.code === currentLocale
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{lang.flag}</span>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <LanguageSelector currentLocale={locale} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white text-xl font-bold">
              S
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sovra Partner Portal</h1>
          <p className="mt-2 text-gray-500">{tLogin('subtitle')}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('login')}
            </Button>
          </form>
        </Card>
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
