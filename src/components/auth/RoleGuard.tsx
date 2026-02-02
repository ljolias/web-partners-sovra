'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission, type Permission } from '@/lib/permissions';
import type { User, UserRole } from '@/types';

interface RoleGuardProps {
  user: User;
  permission: Permission;
  locale: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side role guard component
 * Redirects to dashboard if user doesn't have required permission
 */
export function RoleGuard({
  user,
  permission,
  locale,
  children,
  fallback,
}: RoleGuardProps) {
  const router = useRouter();

  const isAuthorized = useMemo(() => {
    const userRole = user.role as UserRole;
    return hasPermission(userRole, permission);
  }, [user.role, permission]);

  useEffect(() => {
    if (!isAuthorized) {
      router.replace(`/${locale}/partners/portal`);
    }
  }, [isAuthorized, locale, router]);

  if (!isAuthorized) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
