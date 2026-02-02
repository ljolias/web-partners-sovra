// Redis Key Patterns for Partner Portal

export const keys = {
  // Partners
  partner: (id: string) => `partner:${id}`,
  partnerUsers: (partnerId: string) => `partner:${partnerId}:users`,
  partnersByTier: (tier: string) => `partners:by-tier:${tier}`,

  // Users & Sessions
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
  session: (id: string) => `session:${id}`,

  // Deals
  deal: (id: string) => `deal:${id}`,
  partnerDeals: (partnerId: string) => `partner:${partnerId}:deals`,
  dealsByDomain: (domain: string) => `deals:by-domain:${domain.toLowerCase()}`,
  dealsByStage: (stage: string) => `deals:by-stage:${stage}`,
  dealsByStatus: (status: string) => `deals:by-status:${status}`,
  allDeals: () => `deals:all`,

  // Quotes
  quote: (id: string) => `quote:${id}`,
  dealQuotes: (dealId: string) => `deal:${dealId}:quotes`,
  partnerQuotes: (partnerId: string) => `partner:${partnerId}:quotes`,

  // Pricing Configuration
  pricingConfig: () => `pricing:config`,

  // Training & Certifications
  trainingModule: (id: string) => `training:module:${id}`,
  trainingModules: () => `training:modules`,
  userTrainingProgress: (userId: string) => `user:${userId}:training:progress`,
  certification: (id: string) => `certification:${id}`,
  userCertifications: (userId: string) => `user:${userId}:certifications`,
  partnerCertifications: (partnerId: string) => `partner:${partnerId}:certifications`,

  // Legal
  legalDocument: (id: string) => `legal:document:${id}`,
  legalDocuments: () => `legal:documents`,
  legalSignature: (id: string) => `legal:signature:${id}`,
  userSignatures: (userId: string) => `user:${userId}:signatures`,
  partnerSignatures: (partnerId: string) => `partner:${partnerId}:signatures`,

  // Copilot
  copilotSession: (id: string) => `copilot:session:${id}`,
  copilotMessages: (sessionId: string) => `copilot:session:${sessionId}:messages`,
  copilotMeddic: (sessionId: string) => `copilot:session:${sessionId}:meddic`,
  dealCopilotSessions: (dealId: string) => `deal:${dealId}:copilot:sessions`,

  // Commissions
  commission: (id: string) => `commission:${id}`,
  partnerCommissions: (partnerId: string) => `partner:${partnerId}:commissions`,
  dealCommission: (dealId: string) => `deal:${dealId}:commission`,

  // Rating
  ratingEvents: (partnerId: string) => `partner:${partnerId}:rating:events`,
  ratingCalculation: (partnerId: string) => `partner:${partnerId}:rating:calculation`,
  partnerLastLogin: (partnerId: string) => `partner:${partnerId}:last-login`,
};

// TTL values in seconds
export const TTL = {
  session: 24 * 60 * 60, // 24 hours
  dealExclusivity: 90 * 24 * 60 * 60, // 90 days
  copilotSession: 7 * 24 * 60 * 60, // 7 days
};
