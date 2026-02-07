import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getCurrentSession } from '@/lib/auth';
import { PortalShell } from '@/components/portal/PortalShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Partner, User } from '@/types';

interface PortalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { locale } = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/partners/login`);
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ErrorBoundary>
        <PortalShell
          partner={session.partner as Partner}
          user={session.user as User}
          locale={locale}
        >
          {children}
        </PortalShell>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
