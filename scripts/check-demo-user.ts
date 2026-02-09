import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';

async function checkDemoUser() {
  console.log('🔍 Checking for demo@sovra.io user...\n');

  const userId = await redis.get<string>(keys.userByEmail('demo@sovra.io'));

  if (userId) {
    console.log('✅ Demo user exists!');
    const user = await redis.hgetall(keys.user(userId));
    console.log('User ID:', user?.id);
    console.log('Name:', user?.name);
    console.log('Role:', user?.role);
    console.log('Partner ID:', user?.partnerId);

    if (user?.partnerId) {
      const partner = await redis.hgetall(keys.partner(user.partnerId as string));
      console.log('\n📦 Partner:', partner?.companyName);
      console.log('Tier:', partner?.tier);

      // Get deals
      const dealIds = await redis.zrange(keys.partnerDeals(user.partnerId as string), 0, -1);
      console.log('\n📋 Total Deals:', dealIds.length);

      let approvedWithQuote = 0;
      for (const dealId of dealIds) {
        const deal = await redis.hgetall(keys.deal(dealId as string));
        const quotes = await redis.zrange(keys.dealQuotes(dealId as string), 0, -1);

        if (deal?.status === 'approved' && quotes.length > 0) {
          approvedWithQuote++;
          console.log(`\n✅ Deal listo para probar: ${deal?.clientName}`);
          console.log(`   ID: ${dealId}`);
          console.log(`   Status: ${deal?.status}`);
          console.log(`   Quotes: ${quotes.length}`);
          console.log(`   URL: http://localhost:3000/es/partners/portal/deals/${dealId}`);
        }
      }

      console.log(`\n📊 Deals aprobados con quote: ${approvedWithQuote}`);
    }
  } else {
    console.log('❌ Demo user does not exist');
  }
}

checkDemoUser().catch(console.error);
