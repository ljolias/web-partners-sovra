import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getSession, getUser, getPricingConfig, savePricingConfig } from '@/lib/redis/operations';
import type { PricingConfig } from '@/types';

const pricingConfigSchema = z.object({
  sovraGov: z.object({
    tiers: z.array(z.object({
      maxPopulation: z.number().positive(),
      pricePerInhabitant: z.number().positive(),
    })),
  }),
  sovraId: z.object({
    essentials: z.object({
      monthlyLimit: z.number().positive(),
      monthlyPrice: z.number().positive(),
    }),
    professional: z.object({
      monthlyLimit: z.number().positive(),
      monthlyPrice: z.number().positive(),
    }),
    enterprise: z.object({
      monthlyLimit: z.number().positive(),
      monthlyPrice: z.number().positive(),
    }),
  }),
  services: z.object({
    walletImplementation: z.number().nonnegative(),
    integrationHourlyRate: z.number().nonnegative(),
  }),
  discounts: z.object({
    bronze: z.object({
      base: z.number().min(0).max(100),
      leadBonus: z.number().min(0).max(100),
    }),
    silver: z.object({
      base: z.number().min(0).max(100),
      leadBonus: z.number().min(0).max(100),
    }),
    gold: z.object({
      base: z.number().min(0).max(100),
      leadBonus: z.number().min(0).max(100),
    }),
    platinum: z.object({
      base: z.number().min(0).max(100),
      leadBonus: z.number().min(0).max(100),
    }),
  }),
});

async function verifySovraAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('partner_session')?.value;

  if (!sessionId) {
    throw new Error('Unauthorized');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await getUser(session.userId);
  if (!user || user.role !== 'sovra_admin') {
    throw new Error('Forbidden');
  }

  return user;
}

export async function GET() {
  try {
    await verifySovraAdmin();
    const config = await getPricingConfig();
    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    logger.error('Get pricing config error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await verifySovraAdmin();

    const body = await request.json();
    const validation = pricingConfigSchema.safeParse(body);

    if (!validation.success) {
      const issues = validation.error.issues;
      return NextResponse.json(
        { error: issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const config: PricingConfig = validation.data;
    await savePricingConfig(config);

    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    logger.error('Update pricing config error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
