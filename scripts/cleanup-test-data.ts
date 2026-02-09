import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';

async function cleanup() {
  console.log('🧹 Starting cleanup...\n');

  // 1. Find the partner associated with demo@sovra.io
  console.log('📋 Finding partner for demo@sovra.io...');
  
  // Get all partner IDs
  const allPartnerIds = await redis.zrange<string[]>(keys.allPartners(), 0, -1);
  console.log(`Found ${allPartnerIds.length} total partners`);

  let demoPartnerId: string | null = null;
  let demoPartnerName = '';

  // Find the partner with users that have demo@sovra.io
  for (const partnerId of allPartnerIds) {
    const userIds = await redis.smembers<string[]>(keys.partnerUsers(partnerId));
    
    for (const userId of userIds) {
      const userData = await redis.hgetall(keys.user(userId));
      if (userData?.email === 'demo@sovra.io') {
        demoPartnerId = partnerId;
        const partnerData = await redis.hgetall(keys.partner(partnerId));
        demoPartnerName = partnerData?.companyName as string || 'Unknown';
        console.log(`✅ Found demo partner: ${demoPartnerName} (${partnerId})`);
        break;
      }
    }
    if (demoPartnerId) break;
  }

  if (!demoPartnerId) {
    console.error('❌ Could not find partner for demo@sovra.io');
    process.exit(1);
  }

  // 2. Delete all other partners
  console.log('\n🗑️  Deleting other partners...');
  let deletedPartnersCount = 0;

  for (const partnerId of allPartnerIds) {
    if (partnerId === demoPartnerId) {
      console.log(`⏭️  Skipping demo partner: ${demoPartnerName}`);
      continue;
    }

    const partnerData = await redis.hgetall(keys.partner(partnerId));
    console.log(`   Deleting: ${partnerData?.companyName || partnerId}`);

    // Delete partner users
    const userIds = await redis.smembers<string[]>(keys.partnerUsers(partnerId));
    for (const userId of userIds) {
      // Delete user by email index
      const userData = await redis.hgetall(keys.user(userId));
      if (userData?.email) {
        await redis.del(keys.userByEmail(userData.email as string));
      }
      await redis.del(keys.user(userId));
      
      // Delete user sessions
      const sessionPattern = `session:*`;
      const sessions = await redis.keys(sessionPattern);
      for (const sessionKey of sessions) {
        const sessionData = await redis.hgetall(sessionKey);
        if (sessionData?.userId === userId) {
          await redis.del(sessionKey);
        }
      }
    }
    await redis.del(keys.partnerUsers(partnerId));

    // Delete partner deals
    const dealIds = await redis.zrange<string[]>(keys.partnerDeals(partnerId), 0, -1);
    for (const dealId of dealIds) {
      await redis.del(keys.deal(dealId));
      await redis.del(keys.dealQuotes(dealId));
      await redis.del(keys.dealStatusHistory(dealId));
      await redis.zrem(keys.allDeals(), dealId);
    }
    await redis.del(keys.partnerDeals(partnerId));

    // Delete partner credentials
    const credentialIds = await redis.zrange<string[]>(keys.partnerCredentials(partnerId), 0, -1);
    for (const credId of credentialIds) {
      await redis.del(keys.partnerCredential(credId));
      await redis.zrem(keys.allCredentials(), credId);
    }
    await redis.del(keys.partnerCredentials(partnerId));

    // Delete partner documents
    const docPattern = `legal:${partnerId}:*`;
    const docKeys = await redis.keys(docPattern);
    for (const docKey of docKeys) {
      await redis.del(docKey);
    }

    // Delete partner itself
    await redis.del(keys.partner(partnerId));
    await redis.zrem(keys.allPartners(), partnerId);

    deletedPartnersCount++;
  }

  console.log(`✅ Deleted ${deletedPartnersCount} partners\n`);

  // 3. Delete all deals (including from demo partner)
  console.log('🗑️  Deleting all deals...');
  const allDealIds = await redis.zrange<string[]>(keys.allDeals(), 0, -1);
  console.log(`Found ${allDealIds.length} deals to delete`);

  for (const dealId of allDealIds) {
    // Delete quotes for this deal
    const quoteIds = await redis.zrange<string[]>(keys.dealQuotes(dealId), 0, -1);
    for (const quoteId of quoteIds) {
      await redis.del(keys.quote(quoteId));
    }
    await redis.del(keys.dealQuotes(dealId));

    // Delete status history
    const changeIds = await redis.zrange<string[]>(keys.dealStatusHistory(dealId), 0, -1);
    for (const changeId of changeIds) {
      await redis.del(keys.dealStatusChange(changeId));
    }
    await redis.del(keys.dealStatusHistory(dealId));

    // Delete deal itself
    await redis.del(keys.deal(dealId));
    await redis.zrem(keys.allDeals(), dealId);
  }

  // Clear partner deals index for demo partner
  await redis.del(keys.partnerDeals(demoPartnerId));

  console.log(`✅ Deleted ${allDealIds.length} deals\n`);

  // 4. Clear audit logs
  console.log('🗑️  Clearing audit logs...');
  const auditPattern = 'audit:*';
  const auditKeys = await redis.keys(auditPattern);
  for (const key of auditKeys) {
    await redis.del(key);
  }
  console.log(`✅ Cleared ${auditKeys.length} audit log entries\n`);

  // 5. Summary
  console.log('📊 Cleanup Summary:');
  console.log(`   ✅ Kept partner: ${demoPartnerName} (${demoPartnerId})`);
  console.log(`   ✅ Deleted ${deletedPartnersCount} other partners`);
  console.log(`   ✅ Deleted ${allDealIds.length} deals`);
  console.log(`   ✅ Cleared audit logs`);
  console.log(`   ✅ Demo account ready for testing from scratch\n`);

  console.log('✨ Cleanup complete!');
  process.exit(0);
}

cleanup().catch((error) => {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
});
