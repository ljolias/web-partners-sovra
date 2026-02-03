import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { redis } from '@/lib/redis/client';

/**
 * POST /api/sovra/cleanup
 *
 * Temporary endpoint to clean up test data.
 * Only accessible by Sovra Admin.
 * DELETE THIS FILE AFTER USE.
 */
export async function POST() {
  try {
    const { user } = await requireSession();

    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results: string[] = [];

    // Get all credentials
    const credentialIds = await redis.zrange<string[]>('credentials:all', 0, -1);
    results.push(`Credenciales encontradas: ${credentialIds.length}`);

    for (const id of credentialIds) {
      const cred = await redis.hgetall(`credential:${id}`) as Record<string, string> | null;
      if (cred && cred.id) {
        results.push(`- Eliminando credencial: ${cred.holderName} (${cred.holderEmail})`);
        await redis.del(`credential:${id}`);
        await redis.zrem('credentials:all', id);
        if (cred.partnerId) {
          await redis.zrem(`partner:${cred.partnerId}:credentials`, id);
        }
        if (cred.holderEmail) {
          await redis.del(`credential:email:${cred.holderEmail.toLowerCase()}`);
        }
        // Clean up status sets
        await redis.srem('credentials:status:issued', id);
        await redis.srem('credentials:status:active', id);
        await redis.srem('credentials:status:claimed', id);
        await redis.srem('credentials:status:pending', id);
        await redis.srem('credentials:status:revoked', id);
      }
    }

    // Get all partners
    const partnerIds = await redis.zrange<string[]>('partners:all', 0, -1);
    results.push(`\nPartners encontrados: ${partnerIds.length}`);

    for (const id of partnerIds) {
      const partner = await redis.hgetall(`partner:${id}`) as Record<string, string> | null;
      // Skip demo partner
      if (partner && partner.id && !partner.companyName?.toLowerCase().includes('demo')) {
        results.push(`- Eliminando partner: ${partner.companyName}`);

        // Delete partner users
        const userIds = await redis.smembers<string[]>(`partner:${id}:users`);
        for (const userId of userIds) {
          const userData = await redis.hgetall(`user:${userId}`) as Record<string, string> | null;
          // Don't delete sovra_admin users
          if (userData && userData.email && userData.role !== 'sovra_admin') {
            results.push(`  - Eliminando usuario: ${userData.name} (${userData.email})`);
            await redis.del(`user:${userId}`);
            await redis.del(`user:email:${userData.email.toLowerCase()}`);
            await redis.srem(`partner:${id}:users`, userId);
          }
        }

        // Delete partner data
        await redis.del(`partner:${id}:users`);
        await redis.del(`partner:${id}:credentials`);
        await redis.del(`partner:${id}:deals`);
        await redis.del(`partner:${id}`);
        await redis.zrem('partners:all', id);
      }
    }

    results.push('\n=== Limpieza completada ===');

    return NextResponse.json({
      success: true,
      results: results.join('\n'),
      message: 'Datos de prueba eliminados. RECUERDA BORRAR ESTE ARCHIVO.'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
