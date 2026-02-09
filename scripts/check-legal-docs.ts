import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';

async function checkLegalDocs() {
  console.log('🔍 Checking legal documents...\n');

  // Find demo partner
  const allPartnerIds = await redis.zrange<string[]>(keys.allPartners(), 0, -1);
  let demoPartnerId: string | null = null;

  for (const partnerId of allPartnerIds) {
    const userIds = await redis.smembers<string[]>(keys.partnerUsers(partnerId));
    for (const userId of userIds) {
      const userData = await redis.hgetall(keys.user(userId));
      if (userData?.email === 'demo@sovra.io') {
        demoPartnerId = partnerId;
        
        console.log('📋 Demo Partner:', partnerId);
        console.log('📋 Demo User:', userId, '\n');

        // Check partner documents
        const partnerDocsKey = `partner:${partnerId}:legal:documents`;
        const partnerDocs = await redis.zrange(partnerDocsKey, 0, -1);
        console.log('Partner legal documents:', partnerDocs.length);
        
        if (partnerDocs.length > 0) {
          console.log('Documents found:');
          for (const docId of partnerDocs) {
            const doc = await redis.hgetall(`legal:${docId}`);
            console.log(`  - ${doc?.title || docId}`, {
              requiredForDeals: doc?.requiredForDeals,
              status: doc?.status
            });
          }
        }

        // Check user signatures
        const signaturesKey = `user:${userId}:signatures`;
        const signatures = await redis.zrange(signaturesKey, 0, -1);
        console.log('\nUser signatures:', signatures.length);

        // Check all legal documents in system
        console.log('\n🔍 Checking all legal documents in system...');
        const allDocsKeys = await redis.keys('legal:*');
        console.log('Total legal document keys:', allDocsKeys.length);
        
        if (allDocsKeys.length > 0) {
          console.log('\nAll documents:');
          for (const key of allDocsKeys.slice(0, 10)) {
            const doc = await redis.hgetall(key);
            if (doc?.title) {
              console.log(`  - ${key}:`, {
                title: doc.title,
                requiredForDeals: doc.requiredForDeals,
                partnerId: doc.partnerId
              });
            }
          }
        }

        process.exit(0);
      }
    }
  }

  console.error('❌ Demo user not found');
  process.exit(1);
}

checkLegalDocs().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
