import { redirect } from 'next/navigation';

interface CertificationsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CertificationsPage({ params }: CertificationsPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/partners/portal/training-center`);
}
