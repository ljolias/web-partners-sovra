import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';
import type { Deal, Quote } from '../src/types';

async function createDemoDeal() {
  console.log('🚀 Creating deal for demo user...\n');

  const userId = '1770400563504-7ot5gtk';
  const partnerId = '1770400562148-wvoe8a3';

  // Create Approved Deal
  const dealId = `${Date.now()}-deal`;
  const deal: Deal = {
    id: dealId,
    partnerId: partnerId,
    clientName: 'Municipalidad de Córdoba',
    country: 'Argentina',
    governmentLevel: 'municipality',
    population: 1500000,
    contactName: 'Roberto Fernández',
    contactRole: 'Secretario de Innovación',
    contactEmail: 'rfernandez@cordoba.gob.ar',
    contactPhone: '+54 351 4567-890',
    description: 'Implementación de sistema de identidad digital para ciudadanos. Incluye credenciales verificables, wallet móvil y portal de servicios digitales.',
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

  // Create Quote
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
        populationUsed: 1500000,
        pricePerInhabitant: 0.18,
        annualPrice: 270000,
      },
      sovraId: {
        included: true,
        plan: 'professional',
        monthlyLimit: 30000,
        monthlyPrice: 3500,
        annualPrice: 42000,
      },
    },
    services: {
      walletImplementation: true,
      walletPrice: 20000,
      integrationHours: 60,
      integrationPricePerHour: 150,
      integrationTotal: 9000,
    },
    discounts: {
      partnerTier: 'gold',
      partnerGeneratedLead: true,
      baseDiscountPercent: 15,
      leadBonusPercent: 5,
      totalDiscountPercent: 20,
      discountAmount: 68200,
    },
    subtotal: 341000,
    totalDiscount: 68200,
    total: 272800,
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

  console.log('\n' + '='.repeat(70));
  console.log('✨ LISTO PARA PROBAR');
  console.log('='.repeat(70));
  console.log('\n🔐 Login:');
  console.log('   URL: http://localhost:3000');
  console.log('   Email: demo@sovra.io');
  console.log('   Password: (tu password habitual)');
  console.log('\n🎯 Deal para probar:');
  console.log('   Cliente: Municipalidad de Córdoba');
  console.log('   Estado: Aprobada (con cotización)');
  console.log('   Deal ID:', dealId);
  console.log('\n🔗 Link directo:');
  console.log('   http://localhost:3000/es/partners/portal/deals/' + dealId);
  console.log('\n📝 Qué hacer:');
  console.log('   1. Abre el link del deal');
  console.log('   2. En el sidebar verás "Actualizar Estado"');
  console.log('   3. Cambia a "En Negociación"');
  console.log('   4. Agrega notas y guarda');
  console.log('   5. Verás el historial aparecer abajo');
  console.log('\n' + '='.repeat(70));
}

createDemoDeal().catch(console.error);
