import { NextResponse } from 'next/server';
import { requireSession } from './session';
import { hasPermission, type Permission } from '@/lib/permissions';
import type { UserRole } from '@/types';

/**
 * Higher-order function to protect API routes with role-based access control
 */
export function withRoleGuard<T>(
  permission: Permission,
  handler: (sessionData: Awaited<ReturnType<typeof requireSession>>) => Promise<T>
): () => Promise<NextResponse<T> | NextResponse<{ error: string }>> {
  return async () => {
    try {
      const sessionData = await requireSession();
      const userRole = sessionData.user.role as UserRole;

      if (!hasPermission(userRole, permission)) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }

      return await handler(sessionData) as NextResponse<T>;
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      console.error('API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Middleware function to check permission and return session data
 * Use this for more complex handlers that need request access
 */
export async function checkPermission(
  permission: Permission
): Promise<
  | { authorized: true; sessionData: Awaited<ReturnType<typeof requireSession>> }
  | { authorized: false; response: NextResponse<{ error: string }> }
> {
  try {
    const sessionData = await requireSession();
    const userRole = sessionData.user.role as UserRole;

    if (!hasPermission(userRole, permission)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, sessionData };
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}
