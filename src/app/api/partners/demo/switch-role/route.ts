import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { updateUser } from '@/lib/redis';
import type { UserRole } from '@/types';

const switchRoleSchema = z.object({
  role: z.enum(['admin', 'sales', 'viewer', 'sovra_admin']),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSession();

    const body = await request.json();
    const validation = switchRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const { role } = validation.data;

    // Update user role in Redis
    await updateUser(user.id, { role: role as UserRole });

    return NextResponse.json({
      success: true,
      role,
      message: `Role switched to ${role}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Switch role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
