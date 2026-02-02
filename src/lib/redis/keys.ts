// Redis Key Patterns for Partner Portal

export const keys = {
  // Partners
  partner: (id: string) => `partner:${id}`,
  partnerUsers: (partnerId: string) => `partner:${partnerId}:users`,
  partnersByTier: (tier: string) => `partners:by-tier:${tier}`,
  partnersByStatus: (status: string) => `partners:by-status:${status}`,
  partnersByCountry: (country: string) => `partners:by-country:${country}`,
  allPartners: () => `partners:all`,

  // Partner Credentials (SovraID)
  partnerCredential: (id: string) => `credential:${id}`,
  partnerCredentials: (partnerId: string) => `partner:${partnerId}:credentials`,
  allCredentials: () => `credentials:all`,
  credentialsByStatus: (status: string) => `credentials:by-status:${status}`,
  credentialByEmail: (email: string) => `credential:email:${email.toLowerCase()}`,

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

  // Legal - Legacy
  legalDocument: (id: string) => `legal:document:${id}`,
  legalDocuments: () => `legal:documents`,
  legalSignature: (id: string) => `legal:signature:${id}`,
  userSignatures: (userId: string) => `user:${userId}:signatures`,
  partnerSignatures: (partnerId: string) => `partner:${partnerId}:signatures`,

  // Legal - Enhanced Documents
  legalDocumentV2: (id: string) => `legal:v2:document:${id}`,
  partnerLegalDocuments: (partnerId: string) => `partner:${partnerId}:legal:documents`,
  allLegalDocumentsV2: () => `legal:v2:all`,
  legalDocumentsByCategory: (category: string) => `legal:v2:by-category:${category}`,
  legalDocumentsByStatus: (status: string) => `legal:v2:by-status:${status}`,
  docusignEnvelope: (envelopeId: string) => `legal:docusign:envelope:${envelopeId}`,

  // Legal - Audit Events
  documentAuditEvents: (documentId: string) => `legal:v2:document:${documentId}:audit`,
  documentAuditEvent: (eventId: string) => `legal:v2:audit:${eventId}`,

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

  // Training Courses (Admin-managed)
  trainingCourse: (id: string) => `training:course:${id}`,
  allTrainingCourses: () => `training:courses:all`,
  publishedTrainingCourses: () => `training:courses:published`,
  trainingCoursesByCategory: (category: string) => `training:courses:by-category:${category}`,
  userCourseProgress: (userId: string) => `user:${userId}:courses:progress`,

  // Audit Logs
  auditLog: (id: string) => `audit:log:${id}`,
  allAuditLogs: () => `audit:logs:all`,
  auditLogsByEntity: (entityType: string, entityId: string) => `audit:logs:entity:${entityType}:${entityId}`,
  auditLogsByAction: (action: string) => `audit:logs:by-action:${action}`,
  auditLogsByActor: (actorId: string) => `audit:logs:by-actor:${actorId}`,
};

// TTL values in seconds
export const TTL = {
  session: 24 * 60 * 60, // 24 hours
  dealExclusivity: 90 * 24 * 60 * 60, // 90 days
  copilotSession: 7 * 24 * 60 * 60, // 7 days
};
