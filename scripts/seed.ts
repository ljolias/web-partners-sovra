/**
 * Seed script for Partner Portal
 * Run with: npx tsx scripts/seed.ts
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

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

async function seed() {
  console.log('Starting seed...');

  // Create Partner
  const partnerId = generateId();
  const partner = {
    id: partnerId,
    name: 'Demo Partner',
    companyName: 'Acme Corp',
    email: 'partner@acme.com',
    phone: '+1 555 123 4567',
    tier: 'gold',
    rating: 4.5,
    status: 'active',
    certifications: JSON.stringify(['sales_fundamentals']),
    legalDocsSignedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(`partner:${partnerId}`, partner);
  await redis.zadd(`partners:by-tier:gold`, { score: 4.5, member: partnerId });
  console.log('Partner created:', partnerId);

  // Create Admin User
  const adminUserId = generateId();
  const passwordHash = await bcrypt.hash('demo123', 12);
  const adminUser = {
    id: adminUserId,
    partnerId,
    email: 'admin@sovra.io',
    name: 'John Admin',
    role: 'admin',
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(`user:${adminUserId}`, adminUser);
  await redis.set(`user:email:admin@sovra.io`, adminUserId);
  await redis.sadd(`partner:${partnerId}:users`, adminUserId);
  console.log('Admin user created:', adminUserId);

  // Create Sales User
  const salesUserId = generateId();
  const salesUser = {
    id: salesUserId,
    partnerId,
    email: 'sales@sovra.io',
    name: 'Sarah Sales',
    role: 'sales',
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(`user:${salesUserId}`, salesUser);
  await redis.set(`user:email:sales@sovra.io`, salesUserId);
  await redis.sadd(`partner:${partnerId}:users`, salesUserId);
  console.log('Sales user created:', salesUserId);

  // Keep backward compatibility with old email
  const userId = adminUserId;

  // Create Certification
  const certId = generateId();
  const cert = {
    id: certId,
    userId,
    partnerId,
    type: 'sales_fundamentals',
    status: 'active',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await redis.hset(`certification:${certId}`, cert);
  await redis.sadd(`user:${userId}:certifications`, certId);
  await redis.sadd(`partner:${partnerId}:certifications`, certId);
  console.log('Admin certification created:', certId);

  // Create Certification for Sales User
  const salesCertId = generateId();
  const salesCert = {
    id: salesCertId,
    userId: salesUserId,
    partnerId,
    type: 'sales_fundamentals',
    status: 'active',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await redis.hset(`certification:${salesCertId}`, salesCert);
  await redis.sadd(`user:${salesUserId}:certifications`, salesCertId);
  await redis.sadd(`partner:${partnerId}:certifications`, salesCertId);
  console.log('Sales certification created:', salesCertId);

  // Create Legal Documents
  const legalDocs = [
    {
      id: generateId(),
      type: 'nda',
      version: '1.0',
      title: JSON.stringify({ en: 'Non-Disclosure Agreement', es: 'Acuerdo de Confidencialidad', pt: 'Acordo de Confidencialidade' }),
      content: JSON.stringify({ en: 'NDA content here...', es: 'Contenido del NDA aqui...', pt: 'Conteudo do NDA aqui...' }),
      requiredForDeals: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'partner_agreement',
      version: '1.0',
      title: JSON.stringify({ en: 'Partner Agreement', es: 'Acuerdo de Partner', pt: 'Acordo de Parceiro' }),
      content: JSON.stringify({ en: 'Partner agreement content...', es: 'Contenido del acuerdo...', pt: 'Conteudo do acordo...' }),
      requiredForDeals: true,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const doc of legalDocs) {
    await redis.hset(`legal:document:${doc.id}`, doc);
    await redis.sadd('legal:documents', doc.id);

    // Sign documents for admin user
    const adminSigId = generateId();
    const adminSignature = {
      id: adminSigId,
      documentId: doc.id,
      userId: adminUserId,
      partnerId,
      signedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    await redis.hset(`legal:signature:${adminSigId}`, adminSignature);
    await redis.sadd(`user:${adminUserId}:signatures`, adminSigId);
    await redis.sadd(`partner:${partnerId}:signatures`, adminSigId);

    // Sign documents for sales user
    const salesSigId = generateId();
    const salesSignature = {
      id: salesSigId,
      documentId: doc.id,
      userId: salesUserId,
      partnerId,
      signedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    await redis.hset(`legal:signature:${salesSigId}`, salesSignature);
    await redis.sadd(`user:${salesUserId}:signatures`, salesSigId);
    await redis.sadd(`partner:${partnerId}:signatures`, salesSigId);
  }
  console.log('Legal documents created and signed for both users');

  // Create Training Modules
  const trainingModules = [
    {
      id: 'mod-1',
      title: JSON.stringify({ en: 'Sales Fundamentals', es: 'Fundamentos de Ventas', pt: 'Fundamentos de Vendas' }),
      description: JSON.stringify({
        en: 'Learn the basics of B2B sales',
        es: 'Aprende los fundamentos de ventas B2B',
        pt: 'Aprenda os fundamentos de vendas B2B',
      }),
      content: JSON.stringify({
        en: 'Module 1 content about sales fundamentals...',
        es: 'Contenido del modulo 1 sobre fundamentos de ventas...',
        pt: 'Conteudo do modulo 1 sobre fundamentos de vendas...',
      }),
      duration: 30,
      order: 1,
      quiz: JSON.stringify([
        {
          id: 'q1',
          question: { en: 'What is the first step in B2B sales?', es: 'Cual es el primer paso en ventas B2B?', pt: 'Qual e o primeiro passo em vendas B2B?' },
          options: {
            en: ['Closing the deal', 'Understanding the customer needs', 'Sending a proposal', 'Negotiating price'],
            es: ['Cerrar el trato', 'Entender las necesidades del cliente', 'Enviar una propuesta', 'Negociar el precio'],
            pt: ['Fechar o negocio', 'Entender as necessidades do cliente', 'Enviar uma proposta', 'Negociar preco'],
          },
          correctAnswer: 1,
        },
        {
          id: 'q2',
          question: { en: 'What does MEDDIC stand for?', es: 'Que significa MEDDIC?', pt: 'O que significa MEDDIC?' },
          options: {
            en: ['A sales methodology', 'A pricing model', 'A CRM system', 'A marketing strategy'],
            es: ['Una metodologia de ventas', 'Un modelo de precios', 'Un sistema CRM', 'Una estrategia de marketing'],
            pt: ['Uma metodologia de vendas', 'Um modelo de precos', 'Um sistema CRM', 'Uma estrategia de marketing'],
          },
          correctAnswer: 0,
        },
      ]),
      passingScore: 80,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mod-2',
      title: JSON.stringify({ en: 'Product Knowledge', es: 'Conocimiento del Producto', pt: 'Conhecimento do Produto' }),
      description: JSON.stringify({
        en: 'Deep dive into Sovra products',
        es: 'Conoce a fondo los productos de Sovra',
        pt: 'Conheca a fundo os produtos da Sovra',
      }),
      content: JSON.stringify({
        en: 'Module 2 content about product knowledge...',
        es: 'Contenido del modulo 2 sobre conocimiento del producto...',
        pt: 'Conteudo do modulo 2 sobre conhecimento do produto...',
      }),
      duration: 45,
      order: 2,
      quiz: JSON.stringify([
        {
          id: 'q1',
          question: { en: 'What is Sovra\'s main product?', es: 'Cual es el producto principal de Sovra?', pt: 'Qual e o produto principal da Sovra?' },
          options: {
            en: ['Enterprise Software', 'Marketing Platform', 'HR System', 'Accounting Software'],
            es: ['Software Empresarial', 'Plataforma de Marketing', 'Sistema de RRHH', 'Software Contable'],
            pt: ['Software Empresarial', 'Plataforma de Marketing', 'Sistema de RH', 'Software Contabil'],
          },
          correctAnswer: 0,
        },
      ]),
      passingScore: 80,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mod-3',
      title: JSON.stringify({ en: 'MEDDIC Methodology', es: 'Metodologia MEDDIC', pt: 'Metodologia MEDDIC' }),
      description: JSON.stringify({
        en: 'Master the MEDDIC sales qualification framework',
        es: 'Domina el framework de calificacion MEDDIC',
        pt: 'Domine o framework de qualificacao MEDDIC',
      }),
      content: JSON.stringify({
        en: 'Module 3 content about MEDDIC...',
        es: 'Contenido del modulo 3 sobre MEDDIC...',
        pt: 'Conteudo do modulo 3 sobre MEDDIC...',
      }),
      duration: 60,
      order: 3,
      quiz: JSON.stringify([
        {
          id: 'q1',
          question: { en: 'What does the M in MEDDIC stand for?', es: 'Que significa la M en MEDDIC?', pt: 'O que significa o M em MEDDIC?' },
          options: {
            en: ['Marketing', 'Metrics', 'Management', 'Money'],
            es: ['Marketing', 'Metricas', 'Gerencia', 'Dinero'],
            pt: ['Marketing', 'Metricas', 'Gerencia', 'Dinheiro'],
          },
          correctAnswer: 1,
        },
        {
          id: 'q2',
          question: { en: 'Who is the Economic Buyer?', es: 'Quien es el Comprador Economico?', pt: 'Quem e o Comprador Economico?' },
          options: {
            en: ['The end user', 'The person with budget authority', 'The IT administrator', 'The project manager'],
            es: ['El usuario final', 'La persona con autoridad presupuestaria', 'El administrador de IT', 'El gerente de proyecto'],
            pt: ['O usuario final', 'A pessoa com autoridade orcamentaria', 'O administrador de TI', 'O gerente de projeto'],
          },
          correctAnswer: 1,
        },
      ]),
      passingScore: 80,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const module of trainingModules) {
    await redis.hset(`training:module:${module.id}`, module);
    await redis.sadd('training:modules', module.id);
  }
  console.log('Training modules created');

  // Mark training as completed for admin user
  const adminProgress = {
    moduleId: 'mod-1',
    userId: adminUserId,
    completed: true,
    quizScore: 100,
    completedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  };
  const adminProgress2 = {
    moduleId: 'mod-2',
    userId: adminUserId,
    completed: true,
    quizScore: 90,
    completedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  };
  await redis.hset(`user:${adminUserId}:training:progress`, {
    'mod-1': JSON.stringify(adminProgress),
    'mod-2': JSON.stringify(adminProgress2),
  });
  console.log('Admin training progress created');

  // Mark training as partially completed for sales user
  const salesProgress = {
    moduleId: 'mod-1',
    userId: salesUserId,
    completed: true,
    quizScore: 85,
    completedAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  };
  await redis.hset(`user:${salesUserId}:training:progress`, {
    'mod-1': JSON.stringify(salesProgress),
  });
  console.log('Sales training progress created');

  // Create sample deals
  const deals = [
    {
      id: generateId(),
      partnerId,
      companyName: 'TechCorp Inc',
      companyDomain: 'techcorp.com',
      contactName: 'Jane Smith',
      contactEmail: 'jane@techcorp.com',
      contactPhone: '+1 555 987 6543',
      dealValue: 50000,
      currency: 'USD',
      stage: 'qualified',
      notes: 'Initial discovery call completed. Strong interest in enterprise package.',
      meddic: JSON.stringify({
        metrics: 3,
        economicBuyer: 4,
        decisionCriteria: 3,
        decisionProcess: 2,
        identifyPain: 4,
        champion: 3,
      }),
      exclusivityExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: adminUserId,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      partnerId,
      companyName: 'Global Industries',
      companyDomain: 'globalind.com',
      contactName: 'Bob Johnson',
      contactEmail: 'bob@globalind.com',
      contactPhone: '+1 555 456 7890',
      dealValue: 120000,
      currency: 'USD',
      stage: 'proposal',
      notes: 'Proposal sent. Waiting for technical review.',
      meddic: JSON.stringify({
        metrics: 4,
        economicBuyer: 4,
        decisionCriteria: 4,
        decisionProcess: 3,
        identifyPain: 5,
        champion: 4,
      }),
      exclusivityExpiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: salesUserId,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      partnerId,
      companyName: 'StartupXYZ',
      companyDomain: 'startupxyz.io',
      contactName: 'Alice Chen',
      contactEmail: 'alice@startupxyz.io',
      contactPhone: '+1 555 111 2222',
      dealValue: 25000,
      currency: 'USD',
      stage: 'closed_won',
      notes: 'Deal closed! Implementation starting next month.',
      meddic: JSON.stringify({
        metrics: 5,
        economicBuyer: 5,
        decisionCriteria: 5,
        decisionProcess: 5,
        identifyPain: 5,
        champion: 5,
      }),
      exclusivityExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: salesUserId,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      partnerId,
      companyName: 'MegaCorp Ltd',
      companyDomain: 'megacorp.com',
      contactName: 'David Lee',
      contactEmail: 'david@megacorp.com',
      contactPhone: '+1 555 333 4444',
      dealValue: 200000,
      currency: 'USD',
      stage: 'negotiation',
      notes: 'Final negotiations in progress.',
      meddic: JSON.stringify({
        metrics: 5,
        economicBuyer: 4,
        decisionCriteria: 5,
        decisionProcess: 4,
        identifyPain: 5,
        champion: 5,
      }),
      exclusivityExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: adminUserId,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const deal of deals) {
    await redis.hset(`deal:${deal.id}`, deal);
    await redis.zadd(`partner:${partnerId}:deals`, {
      score: new Date(deal.createdAt).getTime(),
      member: deal.id,
    });
    await redis.sadd(`deals:by-domain:${deal.companyDomain}`, deal.id);
    await redis.sadd(`deals:by-stage:${deal.stage}`, deal.id);
  }
  console.log('Sample deals created');

  // Create commission for closed deal
  const commissionId = generateId();
  const commission = {
    id: commissionId,
    partnerId,
    dealId: deals[2].id,
    amount: 2500,
    currency: 'USD',
    status: 'pending',
    paidAt: null,
    createdAt: new Date().toISOString(),
  };
  await redis.hset(`commission:${commissionId}`, commission);
  await redis.sadd(`partner:${partnerId}:commissions`, commissionId);
  await redis.set(`deal:${deals[2].id}:commission`, commissionId);
  console.log('Commission created');

  console.log('\n=== Seed Complete ===');
  console.log('Login credentials:');
  console.log('');
  console.log('  Admin User:');
  console.log('    Email: admin@sovra.io');
  console.log('    Password: demo123');
  console.log('');
  console.log('  Sales User:');
  console.log('    Email: sales@sovra.io');
  console.log('    Password: demo123');
  console.log('');
  console.log('Use the Role Switcher button (bottom-right) to test different roles!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
