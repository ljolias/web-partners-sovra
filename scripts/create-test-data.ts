import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';
import { hash } from 'bcryptjs';
import type { Partner, User, Deal, Quote } from '../src/types';

async function createTestData() {
  console.log('🚀 Creating test data for deal status system...\n');

  // 1. Create Partner
  const partnerId = `${Date.now()}-partner`;
  const partner: Partner = {
    id: partnerId,
    companyName: 'Test Partner Corp',
    country: 'Argentina',
    tier: 'gold',
    status: 'active',
    contactName: 'Test Admin',
    contactEmail: 'admin@testpartner.com',
    contactPhone: '+54 11 1234-5678',
    rating: 85,
    totalDeals: 0,
    wonDeals: 0,
    totalRevenue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(keys.partner(partnerId), partner as any);
  await redis.zadd(keys.allPartners(), {
    score: new Date().getTime(),
    member: partnerId,
  });
  console.log('✅ Partner created:', partnerId);
  console.log('   Company:', partner.companyName);

  // 2. Create Admin User
  const userId = `${Date.now()}-user`;
  const passwordHash = await hash('test123456', 10);
  const user: User = {
    id: userId,
    partnerId: partnerId,
    email: 'admin@testpartner.com',
    name: 'Test Admin User',
    role: 'admin',
    passwordHash: passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(keys.user(userId), user as any);
  await redis.hset(keys.userByEmail(user.email), { userId });
  await redis.sadd(keys.partnerUsers(partnerId), userId);
  console.log('✅ User created:', userId);
  console.log('   Email:', user.email);
  console.log('   Password: test123456');

  // 3. Create Approved Deal
  const dealId = `${Date.now()}-deal`;
  const deal: Deal = {
    id: dealId,
    partnerId: partnerId,
    clientName: 'Gobierno de Buenos Aires',
    country: 'Argentina',
    governmentLevel: 'province',
    population: 3000000,
    contactName: 'María González',
    contactRole: 'Directora de Innovación',
    contactEmail: 'mgonzalez@buenosaires.gob.ar',
    contactPhone: '+54 11 9876-5432',
    description: 'Implementación de sistema de identidad digital para ciudadanos de Buenos Aires. Incluye wallet digital y verificación de credenciales.',
    partnerGeneratedLead: true,
    status: 'approved',
    statusChangedAt: new Date().toISOString(),
    statusChangedBy: userId,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(keys.deal(dealId), deal as any);
  await redis.zadd(keys.partnerDeals(partnerId), {
    score: new Date().getTime(),
    member: dealId,
  });
  await redis.zadd(keys.allDeals(), {
    score: new Date().getTime(),
    member: dealId,
  });
  await redis.sadd(keys.dealsByStatus('approved'), dealId);
  console.log('✅ Deal created:', dealId);
  console.log('   Client:', deal.clientName);
  console.log('   Status:', deal.status);

  // 4. Create Quote
  const quoteId = `${Date.now()}-quote`;
  const now = new Date().toISOString();

  const quote: Quote = {
    id: quoteId,
    dealId: dealId,
    partnerId: partnerId,
    version: 1,
    products: {
      sovraGov: {
        included: true,
        populationUsed: 3000000,
        pricePerInhabitant: 0.15,
        annualPrice: 450000,
      },
      sovraId: {
        included: true,
        plan: 'professional',
        monthlyLimit: 50000,
        monthlyPrice: 5000,
        annualPrice: 60000,
      },
    },
    services: {
      walletImplementation: true,
      walletPrice: 25000,
      integrationHours: 80,
      integrationPricePerHour: 150,
      integrationTotal: 12000,
    },
    discounts: {
      partnerTier: 'gold',
      partnerGeneratedLead: true,
      baseDiscountPercent: 15,
      leadBonusPercent: 5,
      totalDiscountPercent: 20,
      discountAmount: 109400,
    },
    subtotal: 547000,
    totalDiscount: 109400,
    total: 437600,
    currency: 'USD',
    createdAt: now,
    updatedAt: now,
  };

  await redis.hset(keys.quote(quoteId), quote as any);
  await redis.zadd(keys.dealQuotes(dealId), {
    score: new Date().getTime(),
    member: quoteId,
  });
  await redis.zadd(keys.partnerQuotes(partnerId), {
    score: new Date().getTime(),
    member: quoteId,
  });

  // Update deal with firstQuoteCreatedAt
  await redis.hset(keys.deal(dealId), {
    firstQuoteCreatedAt: now,
  });

  console.log('✅ Quote created:', quoteId);
  console.log('   Total: $', quote.total.toLocaleString());
  console.log('   Version:', quote.version);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST DATA SUMMARY');
  console.log('='.repeat(60));
  console.log('\n🔐 Login Credentials:');
  console.log('   URL: http://localhost:3000');
  console.log('   Email: admin@testpartner.com');
  console.log('   Password: test123456');
  console.log('\n🎯 Test Deal:');
  console.log('   Deal ID:', dealId);
  console.log('   Client:', deal.clientName);
  console.log('   Status:', deal.status);
  console.log('   Has Quote: ✅ Yes');
  console.log('\n🔗 Direct Links:');
  console.log('   Deals: http://localhost:3000/es/partners/portal/deals');
  console.log('   Deal Detail: http://localhost:3000/es/partners/portal/deals/' + dealId);
  console.log('\n✨ You can now test:');
  console.log('   1. Login with the credentials above');
  console.log('   2. Navigate to the deal detail page');
  console.log('   3. Use "Actualizar Estado" to change status');
  console.log('   4. View status history in the timeline');
  console.log('\n' + '='.repeat(60));
}

createTestData().catch(console.error);
