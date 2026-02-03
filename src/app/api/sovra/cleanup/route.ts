import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { redis } from '@/lib/redis/client';

/**
 * POST /api/sovra/cleanup
 * Temporary endpoint - DELETE AFTER USE
 */
export async function POST() {
  try {
    const { user } = await requireSession();
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results: string[] = [];

    // Delete OS City and Sovra partners
    const partnerIds = await redis.zrange<string[]>('partners:all', 0, -1);
    for (const id of partnerIds) {
      const partner = await redis.hgetall(`partner:${id}`) as Record<string, string> | null;
      if (partner && (
        partner.companyName?.toLowerCase().includes('os city') ||
        partner.companyName?.toLowerCase() === 'sovra'
      )) {
        results.push(`Eliminando partner: ${partner.companyName}`);

        // Delete partner users
        const userIds = await redis.smembers<string[]>(`partner:${id}:users`);
        for (const userId of userIds) {
          const userData = await redis.hgetall(`user:${userId}`) as Record<string, string> | null;
          if (userData && userData.email) {
            results.push(`  - Eliminando usuario: ${userData.name}`);
            await redis.del(`user:${userId}`);
            await redis.del(`user:email:${userData.email.toLowerCase()}`);
          }
        }

        // Delete partner credentials
        const credIds = await redis.zrange<string[]>(`partner:${id}:credentials`, 0, -1);
        for (const credId of credIds) {
          const cred = await redis.hgetall(`credential:${credId}`) as Record<string, string> | null;
          if (cred) {
            results.push(`  - Eliminando credencial: ${cred.holderName}`);
            await redis.del(`credential:${credId}`);
            await redis.zrem('credentials:all', credId);
            if (cred.holderEmail) {
              await redis.del(`credential:email:${cred.holderEmail.toLowerCase()}`);
            }
          }
        }

        await redis.del(`partner:${id}:users`);
        await redis.del(`partner:${id}:credentials`);
        await redis.del(`partner:${id}:deals`);
        await redis.del(`partner:${id}`);
        await redis.zrem('partners:all', id);
      }
    }

    // Delete Gustavo credential from Acme
    const allCredIds = await redis.zrange<string[]>('credentials:all', 0, -1);
    for (const credId of allCredIds) {
      const cred = await redis.hgetall(`credential:${credId}`) as Record<string, string> | null;
      if (cred && cred.holderName?.toLowerCase().includes('gustavo')) {
        results.push(`Eliminando credencial de Gustavo: ${cred.holderName} (${cred.holderEmail})`);
        await redis.del(`credential:${credId}`);
        await redis.zrem('credentials:all', credId);
        if (cred.partnerId) {
          await redis.zrem(`partner:${cred.partnerId}:credentials`, credId);
        }
        if (cred.holderEmail) {
          await redis.del(`credential:email:${cred.holderEmail.toLowerCase()}`);
        }
      }
    }

    results.push('\n=== Limpieza completada ===');
    return NextResponse.json({ success: true, results: results.join('\n') });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
