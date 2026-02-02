/**
 * Seed script for additional Partners
 * Run with: npx tsx scripts/seed-partners.ts
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const testPartners = [
  {
    companyName: 'Claro',
    country: 'Mexico',
    tier: 'platinum' as const,
    status: 'active' as const,
    contactName: 'Roberto Martinez',
    contactEmail: 'roberto.martinez@claro.mx',
    contactPhone: '+52 55 1234 5678',
    rating: 4.8,
    totalDeals: 25,
    wonDeals: 18,
    totalRevenue: 450000,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Claro_logo.svg/1200px-Claro_logo.svg.png',
  },
  {
    companyName: 'Datastar',
    country: 'Argentina',
    tier: 'gold' as const,
    status: 'active' as const,
    contactName: 'Maria Gonzalez',
    contactEmail: 'maria.gonzalez@datastar.ar',
    contactPhone: '+54 11 4567 8901',
    rating: 4.5,
    totalDeals: 15,
    wonDeals: 10,
    totalRevenue: 280000,
    logoUrl: '',
  },
  {
    companyName: 'ThinkNet',
    country: 'Brasil',
    tier: 'silver' as const,
    status: 'active' as const,
    contactName: 'Carlos Silva',
    contactEmail: 'carlos.silva@thinknet.com.br',
    contactPhone: '+55 11 9876 5432',
    rating: 4.2,
    totalDeals: 8,
    wonDeals: 5,
    totalRevenue: 120000,
    logoUrl: '',
  },
  {
    companyName: 'Phorus',
    country: 'Chile',
    tier: 'bronze' as const,
    status: 'suspended' as const,
    contactName: 'Andrea Lopez',
    contactEmail: 'andrea.lopez@phorus.cl',
    contactPhone: '+56 2 3456 7890',
    rating: 3.8,
    totalDeals: 3,
    wonDeals: 1,
    totalRevenue: 35000,
    logoUrl: '',
    suspendedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    suspendedBy: 'system',
    suspendedReason: 'Incumplimiento de terminos del programa de partners',
  },
  {
    companyName: 'Insaite',
    country: 'Colombia',
    tier: 'gold' as const,
    status: 'active' as const,
    contactName: 'Juan Ramirez',
    contactEmail: 'juan.ramirez@insaite.co',
    contactPhone: '+57 1 2345 6789',
    rating: 4.6,
    totalDeals: 12,
    wonDeals: 8,
    totalRevenue: 195000,
    logoUrl: '',
  },
];

async function seedPartners() {
  console.log('Starting partners seed...');

  for (const partnerData of testPartners) {
    const partnerId = generateId();
    const now = new Date().toISOString();

    // Build partner object without undefined values
    const partner: Record<string, string | number> = {
      id: partnerId,
      companyName: partnerData.companyName,
      country: partnerData.country,
      tier: partnerData.tier,
      status: partnerData.status,
      contactName: partnerData.contactName,
      contactEmail: partnerData.contactEmail,
      contactPhone: partnerData.contactPhone || '',
      rating: partnerData.rating,
      totalDeals: partnerData.totalDeals,
      wonDeals: partnerData.wonDeals,
      totalRevenue: partnerData.totalRevenue,
      logoUrl: partnerData.logoUrl || '',
      // Legacy fields for backward compatibility
      name: partnerData.contactName,
      email: partnerData.contactEmail,
      createdAt: now,
      updatedAt: now,
    };

    // Add suspension fields only if defined
    if ('suspendedAt' in partnerData && partnerData.suspendedAt) {
      partner.suspendedAt = partnerData.suspendedAt;
    }
    if ('suspendedBy' in partnerData && partnerData.suspendedBy) {
      partner.suspendedBy = partnerData.suspendedBy;
    }
    if ('suspendedReason' in partnerData && partnerData.suspendedReason) {
      partner.suspendedReason = partnerData.suspendedReason;
    }

    await redis.hset(`partner:${partnerId}`, partner);
    await redis.zadd(`partners:by-tier:${partnerData.tier}`, {
      score: partnerData.rating,
      member: partnerId,
    });
    await redis.zadd('partners:all', {
      score: new Date(now).getTime(),
      member: partnerId,
    });

    // Add to status index (uses SET, not ZSET)
    await redis.sadd(`partners:by-status:${partnerData.status}`, partnerId);

    // Add to country index (uses SET, not ZSET)
    await redis.sadd(`partners:by-country:${partnerData.country}`, partnerId);

    console.log(`Partner created: ${partnerData.companyName} (${partnerData.tier}, ${partnerData.status})`);
  }

  console.log('\n=== Partners Seed Complete ===');
  console.log('Created partners:');
  testPartners.forEach(p => {
    console.log(`  - ${p.companyName} (${p.country}) - ${p.tier} - ${p.status}`);
  });
}

seedPartners()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
