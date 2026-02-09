import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';
import bcrypt from 'bcryptjs';

async function recreateDemoUser() {
  console.log('🔧 Recreating demo user...\n');

  // Find the demo partner
  const allPartnerIds = await redis.zrange<string[]>(keys.allPartners(), 0, -1);
  let demoPartnerId: string | null = null;

  for (const partnerId of allPartnerIds) {
    const partnerData = await redis.hgetall(keys.partner(partnerId));
    const userIds = await redis.smembers<string[]>(keys.partnerUsers(partnerId));
    
    // Check if this partner has demo@sovra.io user
    for (const userId of userIds) {
      const userData = await redis.hgetall(keys.user(userId));
      if (userData?.email === 'demo@sovra.io') {
        demoPartnerId = partnerId;
        console.log(`✅ Found demo partner: ${partnerData?.companyName} (${partnerId})`);
        console.log(`   Existing user found: ${userData.name} (${userId})`);
        
        // Update password
        const hashedPassword = await bcrypt.hash('demo123', 10);
        await redis.hset(keys.user(userId), {
          password: hashedPassword
        });
        
        console.log(`✅ Password updated to: demo123\n`);
        
        console.log('📋 User details:');
        console.log(`   Email: demo@sovra.io`);
        console.log(`   Password: demo123`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   Partner: ${partnerData?.companyName}`);
        
        process.exit(0);
      }
    }
  }

  if (!demoPartnerId) {
    console.error('❌ Could not find demo partner');
    process.exit(1);
  }
}

recreateDemoUser().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
