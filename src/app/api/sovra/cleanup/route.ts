import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { redis } from '@/lib/redis/client';

export async function POST() {
  try {
    const { user } = await requireSession();
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results: string[] = [];
    const partnersToDelete = ['os city', 'sovra', 'sovragov'];

    const partnerIds = await redis.zrange<string[]>('partners:all', 0, -1);
    for (const id of partnerIds) {
      const partner = await redis.hgetall(`partner:${id}`) as Record<string, string> | null;
      if (partner && partnersToDelete.some(name => partner.companyName?.toLowerCase().includes(name))) {
        results.push(`Eliminando partner: ${partner.companyName}`);

        const userIds = await redis.smembers<string[]>(`partner:${id}:users`);
        for (const userId of userIds) {
          const userData = await redis.hgetall(`user:${userId}`) as Record<string, string> | null;
          if (userData && userData.email && userData.role !== 'sovra_admin') {
            results.push(`  - Usuario: ${userData.name}`);
            await redis.del(`user:${userId}`);
            await redis.del(`user:email:${userData.email.toLowerCase()}`);
          }
        }

        const credIds = await redis.zrange<string[]>(`partner:${id}:credentials`, 0, -1);
        for (const credId of credIds) {
          const cred = await redis.hgetall(`credential:${credId}`) as Record<string, string> | null;
          if (cred) {
            results.push(`  - Credencial: ${cred.holderName}`);
            await redis.del(`credential:${credId}`);
            await redis.zrem('credentials:all', credId);
            if (cred.holderEmail) await redis.del(`credential:email:${cred.holderEmail.toLowerCase()}`);
          }
        }

        await redis.del(`partner:${id}:users`);
        await redis.del(`partner:${id}:credentials`);
        await redis.del(`partner:${id}:deals`);
        await redis.del(`partner:${id}`);
        await redis.zrem('partners:all', id);
      }
    }

    results.push('\n=== Limpieza completada ===');
    return NextResponse.json({ success: true, results: results.join('\n') });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
