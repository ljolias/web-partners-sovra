import { redis } from '../src/lib/redis/client';
import { keys } from '../src/lib/redis/keys';
import bcrypt from 'bcryptjs';

async function fixDemoUser() {
  console.log('🔧 Fixing demo user...\n');

  // Find the demo partner
  const allPartnerIds = await redis.zrange<string[]>(keys.allPartners(), 0, -1);
  let demoPartnerId: string | null = null;
  let demoPartner: any = null;

  for (const partnerId of allPartnerIds) {
    const partnerData = await redis.hgetall(keys.partner(partnerId));
    const userIds = await redis.smembers<string[]>(keys.partnerUsers(partnerId));
    
    for (const userId of userIds) {
      const userData = await redis.hgetall(keys.user(userId));
      if (userData?.email === 'demo@sovra.io') {
        demoPartnerId = partnerId;
        demoPartner = partnerData;
        
        console.log('📋 Current user data:');
        console.log(JSON.stringify(userData, null, 2));
        
        // Check email index
        const emailIndexUserId = await redis.get(keys.userByEmail('demo@sovra.io'));
        console.log(`\n🔍 Email index points to: ${emailIndexUserId}`);
        console.log(`🔍 Actual user ID: ${userId}`);
        
        if (emailIndexUserId !== userId) {
          console.log('⚠️  Email index mismatch! Fixing...');
          await redis.set(keys.userByEmail('demo@sovra.io'), userId);
          console.log('✅ Email index fixed');
        }
        
        // Update user with fresh password
        const hashedPassword = await bcrypt.hash('demo123', 10);
        
        const updatedUser = {
          id: userId,
          partnerId: partnerId,
          name: 'Demo User',
          email: 'demo@sovra.io',
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await redis.hset(keys.user(userId), updatedUser);
        await redis.set(keys.userByEmail('demo@sovra.io'), userId);
        
        console.log('\n✅ User updated successfully!');
        console.log('\n📋 New credentials:');
        console.log('   Email: demo@sovra.io');
        console.log('   Password: demo123');
        console.log(`   Role: admin`);
        console.log(`   Partner: ${demoPartner?.companyName}`);
        console.log(`   Status: active`);
        
        // Test password
        const testHash = await redis.hget(keys.user(userId), 'password');
        const passwordMatches = await bcrypt.compare('demo123', testHash as string);
        console.log(`\n🔐 Password verification: ${passwordMatches ? '✅ PASS' : '❌ FAIL'}`);
        
        process.exit(0);
      }
    }
  }

  console.error('❌ Could not find demo user');
  process.exit(1);
}

fixDemoUser().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
