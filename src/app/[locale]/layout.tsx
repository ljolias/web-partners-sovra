import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';

export const metadata: Metadata = {
  title: 'Sovra Partner Portal',
  description: 'B2B Partner Portal for Sovra Partners',
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return children;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
