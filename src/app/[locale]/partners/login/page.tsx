'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button, Input, Alert, Card } from '@/components/ui';

function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const t = useTranslations('auth');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
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
          <p className="mt-2 text-gray-500">Sign in to your partner account</p>
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
