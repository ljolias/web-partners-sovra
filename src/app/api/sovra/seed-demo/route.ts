import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';
import { generateId } from '@/lib/redis';
import bcrypt from 'bcryptjs';

/**
 * POST /api/sovra/seed-demo
 *
 * Recreate demo data.
 * DELETE THIS FILE AFTER USE.
 */
export async function POST() {
  try {
    const now = new Date().toISOString();

    // First, clean up any existing demo data
    const existingDemoUserId = await redis.get('user:email:demo@sovra.io');
    if (existingDemoUserId) {
      const existingUser = await redis.hgetall(`user:${existingDemoUserId}`) as Record<string, string> | null;
      if (existingUser?.partnerId) {
        await redis.srem(`partner:${existingUser.partnerId}:users`, existingDemoUserId);
      }
      await redis.del(`user:${existingDemoUserId}`);
      await redis.del('user:email:demo@sovra.io');
    }

    const existingSarahUserId = await redis.get('user:email:sarah@acme.com');
    if (existingSarahUserId) {
      const existingUser = await redis.hgetall(`user:${existingSarahUserId}`) as Record<string, string> | null;
      if (existingUser?.partnerId) {
        await redis.srem(`partner:${existingUser.partnerId}:users`, existingSarahUserId);
      }
      await redis.del(`user:${existingSarahUserId}`);
      await redis.del('user:email:sarah@acme.com');
    }

    // Generate proper password hash
    const passwordHash = await bcrypt.hash('demo123', 10);
    console.log('[Seed Demo] Generated password hash for demo123');

    // Create Demo Partner (Acme Corp)
    const partnerId = generateId();
    const partner = {
      id: partnerId,
      companyName: 'Acme Corp',
      country: 'Argentina',
      tier: 'gold',
      status: 'active',
      contactName: 'Demo User',
      contactEmail: 'demo@sovra.io',
      rating: 4.5,
      totalDeals: 12,
      wonDeals: 3,
      totalRevenue: 150000,
      createdAt: now,
      updatedAt: now,
    };

    await redis.hset(`partner:${partnerId}`, partner);
    await redis.zadd('partners:all', { score: Date.now(), member: partnerId });

    // Create Demo User (Admin)
    const demoUserId = generateId();
    const demoUser = {
      id: demoUserId,
      partnerId: partnerId,
      email: 'demo@sovra.io',
      name: 'Demo User',
      role: 'admin',
      passwordHash: passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    await redis.hset(`user:${demoUserId}`, demoUser);
    await redis.set(`user:email:demo@sovra.io`, demoUserId);
    await redis.sadd(`partner:${partnerId}:users`, demoUserId);

    // Create Sarah Sales user
    const sarahUserId = generateId();
    const sarahUser = {
      id: sarahUserId,
      partnerId: partnerId,
      email: 'sarah@acme.com',
      name: 'Sarah Sales',
      role: 'sales',
      passwordHash: passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    await redis.hset(`user:${sarahUserId}`, sarahUser);
    await redis.set(`user:email:sarah@acme.com`, sarahUserId);
    await redis.sadd(`partner:${partnerId}:users`, sarahUserId);

    // Verify the user was created correctly
    const verifyUser = await redis.hgetall(`user:${demoUserId}`) as Record<string, string> | null;
    const verifyEmailIndex = await redis.get('user:email:demo@sovra.io');

    return NextResponse.json({
      success: true,
      message: 'Demo data created',
      partner: {
        id: partnerId,
        name: partner.companyName,
      },
      users: [
        { email: 'demo@sovra.io', password: 'demo123', role: 'admin' },
        { email: 'sarah@acme.com', password: 'demo123', role: 'sales' },
      ],
      debug: {
        demoUserId,
        verifyEmailIndex,
        userExists: !!verifyUser,
        userPartnerId: verifyUser?.partnerId,
        hashLength: passwordHash.length,
      }
    });
  } catch (error) {
    console.error('Seed demo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
