import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession, getUser } from '@/lib/redis/operations';
import SovraShell from '@/components/sovra/SovraShell';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function SovraDashboardLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    redirect(`/${locale}/sovra/login`);
  }

  const session = await getSession(sessionId);
  if (!session) {
    redirect(`/${locale}/sovra/login`);
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    redirect(`/${locale}/sovra/login`);
  }

  return (
    <SovraShell user={user} locale={locale}>
      {children}
    </SovraShell>
  );
}
