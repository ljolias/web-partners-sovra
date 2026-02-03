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

    // Generate proper password hash
    const passwordHash = await bcrypt.hash('demo123', 10);

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
    });
  } catch (error) {
    console.error('Seed demo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
