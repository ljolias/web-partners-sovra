// User Role Types
export type UserRole = 'admin' | 'sales' | 'viewer' | 'sovra_admin';

// Partner Types
export interface Partner {
  id: string;
  companyName: string;
  country: string;
  tier: PartnerTier;
  status: 'active' | 'suspended';

  // Primary contact
  contactName: string;
  contactEmail: string;
  contactPhone?: string;

  // Metrics
  rating: number;
  totalDeals: number;
  wonDeals: number;
  totalRevenue: number;

  // Branding
  logoUrl?: string;

  // Legacy fields (kept for backward compatibility)
  name?: string;
  email?: string;
  phone?: string;
  certifications?: string[];
  legalDocsSignedAt?: string | null;

  // Suspension tracking
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedReason?: string;

  // Audit
  createdAt: string;
  updatedAt: string;
}

export type PartnerTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type PartnerStatus = 'active' | 'suspended';

// Partner Credential (SovraID)
export interface PartnerCredential {
  id: string;
  partnerId: string;
  userId?: string;

  // Credential holder data
  holderName: string;
  holderEmail: string;
  role: 'admin' | 'sales' | 'legal' | 'admin_secondary';

  // SovraID integration
  sovraIdCredentialId?: string;
  sovraIdInvitationId?: string;
  qrCode?: string;
  holderDid?: string;

  // Status
  status: 'pending' | 'issued' | 'claimed' | 'active' | 'revoked';

  // Dates
  issuedAt?: string;
  claimedAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;

  createdAt: string;
  updatedAt: string;
}

export type CredentialStatus = 'pending' | 'issued' | 'claimed' | 'active' | 'revoked';
export type CredentialRole = 'admin' | 'sales' | 'legal' | 'admin_secondary';

// User Types
export interface User {
  id: string;
  partnerId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  // Google OAuth fields (for sovra_admin)
  googleId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  partnerId: string;
  expiresAt: string;
  createdAt: string;
}

// Deal Types - Government Opportunities
export interface Deal {
  id: string;
  partnerId: string;

  // Client (Government)
  clientName: string;           // "Gobierno de San Juan"
  country: string;              // "Argentina"
  governmentLevel: GovernmentLevel;
  population: number;           // 800000

  // Contact
  contactName: string;
  contactRole: string;          // "Director de Innovación"
  contactEmail: string;
  contactPhone?: string;

  // Opportunity
  description: string;
  partnerGeneratedLead: boolean; // Did the partner generate this lead?

  // Status (Approval Workflow)
  status: DealStatus;
  statusChangedAt: string;
  statusChangedBy?: string;     // userId of admin who changed status
  rejectionReason?: string;

  // Metadata
  createdBy: string;            // ID of the sales rep who created the deal
  createdAt: string;
  updatedAt: string;
}

export type GovernmentLevel = 'municipality' | 'province' | 'nation';

export type DealStatus =
  | 'pending_approval'  // Submitted, waiting for Sovra
  | 'approved'          // Approved, can create quotes
  | 'rejected'          // Rejected
  | 'more_info'         // Sovra requested more information
  | 'closed_won'        // Deal closed won
  | 'closed_lost';      // Deal closed lost

// Legacy Deal Stage (kept for backward compatibility)
export type DealStage =
  | 'registered'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

// Quote Types
export interface Quote {
  id: string;
  dealId: string;
  partnerId: string;
  version: number;              // 1, 2, 3... for versions

  // Selected products
  products: QuoteProducts;

  // Professional services
  services: QuoteServices;

  // Discounts
  discounts: QuoteDiscounts;

  // Totals
  subtotal: number;
  totalDiscount: number;
  total: number;
  currency: 'USD';

  // PDF
  pdfUrl?: string;
  pdfGeneratedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface QuoteProducts {
  sovraGov: {
    included: boolean;
    populationUsed: number;
    pricePerInhabitant: number;
    annualPrice: number;
  };
  sovraId: {
    included: boolean;
    plan: SovraIdPlan;
    monthlyLimit: number;
    monthlyPrice: number;
    annualPrice: number;
  };
}

export type SovraIdPlan = 'essentials' | 'professional' | 'enterprise';

export interface QuoteServices {
  walletImplementation: boolean;
  walletPrice: number;
  integrationHours: number;
  integrationPricePerHour: number;
  integrationTotal: number;
}

export interface QuoteDiscounts {
  partnerTier: PartnerTier;
  partnerGeneratedLead: boolean;
  baseDiscountPercent: number;
  leadBonusPercent: number;
  totalDiscountPercent: number;
  discountAmount: number;
}

// Pricing Configuration Types
export interface PricingConfig {
  sovraGov: {
    tiers: Array<{
      maxPopulation: number;
      pricePerInhabitant: number;
    }>;
  };
  sovraId: {
    essentials: { monthlyLimit: number; monthlyPrice: number };
    professional: { monthlyLimit: number; monthlyPrice: number };
    enterprise: { monthlyLimit: number; monthlyPrice: number };
  };
  services: {
    walletImplementation: number;
    integrationHourlyRate: number;
  };
  discounts: {
    bronze: { base: number; leadBonus: number };
    silver: { base: number; leadBonus: number };
    gold: { base: number; leadBonus: number };
    platinum: { base: number; leadBonus: number };
  };
}

export interface MEDDICScores {
  metrics: number;
  economicBuyer: number;
  decisionCriteria: number;
  decisionProcess: number;
  identifyPain: number;
  champion: number;
}

// Training Types (Legacy module format)
// ========== LESSON (Clase) ==========
// Contenido individual: video, lectura, descarga
export interface Lesson {
  id: string;
  title: LocalizedString;
  type: 'video' | 'reading' | 'download';

  // Content by type
  videoUrl?: string;
  content?: LocalizedString; // HTML for reading
  downloadUrl?: string;

  duration: number; // minutes
  order: number;
}

// ========== MODULE (Módulo) ==========
// Agrupación de lecciones + quiz
export interface CourseModule {
  id: string;
  title: LocalizedString;
  description?: LocalizedString;

  // Lessons in this module
  lessons: Lesson[];

  // Quiz at end of module
  quiz?: CourseQuizQuestion[];
  passingScore?: number; // 0-100

  order: number;
  duration?: number; // calculated from lessons
}

// ========== TRAINING COURSE ==========
// Complete course with modules
export interface TrainingCourse {
  id: string;

  // Basic info
  title: LocalizedString;
  description: LocalizedString;
  category: 'sales' | 'technical' | 'legal' | 'product';
  level: 'basic' | 'intermediate' | 'advanced';
  duration: number; // minutes (calculated from modules)

  // Content - modules contain lessons
  modules: CourseModule[];

  // Configuration
  isPublished: boolean;
  isRequired: boolean;
  requiredForTiers?: PartnerTier[];

  // Certification
  passingScore: number; // 0-100
  certificateEnabled: boolean;

  // Order
  order: number;

  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface CourseQuizQuestion {
  id: string;
  question: LocalizedString;
  options: LocalizedString[];
  correctAnswer: number; // index of correct option
}

// Legacy TrainingModule - kept for backward compatibility
export interface TrainingModule {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  content: LocalizedString;
  duration: number; // minutes
  order: number;
  quiz: QuizQuestion[];
  passingScore: number; // percentage
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: LocalizedString;
  options: Record<string, string[]>;
  correctAnswer: number;
}

export type CourseCategory = 'sales' | 'technical' | 'legal' | 'product';
export type CourseLevel = 'basic' | 'intermediate' | 'advanced';

export interface TrainingProgress {
  moduleId: string;
  userId: string;
  completed: boolean;
  quizScore: number | null;
  completedAt: string | null;
  startedAt: string;
}

// Certification Types
export interface Certification {
  id: string;
  userId: string;
  partnerId: string;
  type: CertificationType;
  status: 'active' | 'expired' | 'revoked';
  issuedAt: string;
  expiresAt: string;
}

export type CertificationType = 'sales_fundamentals' | 'technical_specialist' | 'solution_architect';

// Legal Types - Document Categories
export type DocumentCategory =
  | 'contract'        // Contratos legales vinculantes
  | 'amendment'       // Modificaciones a contratos existentes
  | 'compliance'      // Documentos de cumplimiento normativo
  | 'financial'       // Documentos financieros
  | 'certification'   // Certificaciones y acreditaciones
  | 'policy'          // Políticas y procedimientos
  | 'correspondence'; // Comunicaciones formales

// Legal Types - Document Status
export type DocumentStatus =
  | 'draft'              // Borrador (solo DocuSign)
  | 'pending_signature'  // Esperando firmas (DocuSign)
  | 'partially_signed'   // Firmado parcialmente (DocuSign)
  | 'active'             // Vigente/Firmado
  | 'expired'            // Vencido
  | 'superseded'         // Reemplazado por nueva versión
  | 'archived';          // Archivado

// Legacy Legal Document (kept for backward compatibility)
export interface LegacyLegalDocument {
  id: string;
  type: 'nda' | 'partner_agreement' | 'data_processing';
  version: string;
  title: Record<string, string>;
  content: Record<string, string>;
  requiredForDeals: boolean;
  createdAt: string;
}

// Enhanced Legal Document
export interface LegalDocument {
  id: string;
  partnerId: string;

  // Información básica
  title: string;
  description?: string;
  category: DocumentCategory;

  // Tipo de documento
  type: 'docusign' | 'upload';

  // Metadatos específicos según tipo
  docusignMetadata?: DocuSignMetadata;
  uploadMetadata?: UploadMetadata;

  // Estado
  status: DocumentStatus;

  // Versionado
  version: number;
  previousVersionId?: string;

  // Fechas importantes
  effectiveDate?: string;    // Fecha de vigencia
  expirationDate?: string;   // Fecha de vencimiento

  // Flags
  requiredForDeals?: boolean;

  // Auditoría
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// DocuSign specific metadata
export interface DocuSignMetadata {
  envelopeId: string;
  templateId?: string;

  // Estado de DocuSign
  envelopeStatus: 'created' | 'sent' | 'delivered' | 'completed' | 'declined' | 'voided';

  // Firmantes
  signers: DocuSignSigner[];

  // Documento firmado
  signedDocumentUrl?: string;
  certificateUrl?: string;

  // Fechas DocuSign
  sentAt?: string;
  completedAt?: string;
}

export interface DocuSignSigner {
  email: string;
  name: string;
  role: 'partner' | 'sovra';
  status: 'pending' | 'sent' | 'delivered' | 'signed' | 'declined';
  signedAt?: string;
  ipAddress?: string;
}

// Upload specific metadata
export interface UploadMetadata {
  // Archivo
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;

  // Quién lo subió
  uploadedBy: 'partner' | 'sovra';
  uploadedByUserId: string;
  uploadedByName: string;

  // Verificación (opcional)
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

// Document Audit Event
export interface DocumentAuditEvent {
  id: string;
  documentId: string;

  // Acción
  action:
    | 'created'
    | 'uploaded'
    | 'sent_for_signature'
    | 'viewed'
    | 'downloaded'
    | 'signed'
    | 'declined'
    | 'expired'
    | 'archived'
    | 'new_version_created'
    | 'verified'
    | 'rejected'
    | 'shared';

  // Quién realizó la acción
  actorType: 'partner' | 'sovra' | 'system';
  actorId?: string;
  actorName?: string;

  // Detalles adicionales
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;

  timestamp: string;
}

// Legacy signature (kept for backward compatibility)
export interface LegalSignature {
  id: string;
  documentId: string;
  userId: string;
  partnerId: string;
  signedAt: string;
  ipAddress: string;
}

// Copilot Types
export interface CopilotSession {
  id: string;
  dealId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedScores?: Partial<MEDDICScores>;
  createdAt: string;
}

// Commission Types
export interface Commission {
  id: string;
  partnerId: string;
  dealId: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'BRL';
  status: 'pending' | 'approved' | 'paid';
  paidAt: string | null;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalRevenue: number;
  rating: number;
  certifications: number;
  pendingCommissions: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Rating Types
export type RatingEventType =
  | 'COPILOT_SESSION_COMPLETED'
  | 'TRAINING_MODULE_COMPLETED'
  | 'CERTIFICATION_EARNED'
  | 'DEAL_CLOSED_WON'
  | 'MEDDIC_SCORE_IMPROVED'
  | 'DEAL_CLOSED_LOST_POOR_QUALIFICATION'
  | 'CERTIFICATION_EXPIRED'
  | 'LEGAL_EXPIRED'
  | 'DEAL_STALE_30_DAYS'
  | 'LOGIN_INACTIVE_30_DAYS';

export interface RatingEvent {
  id: string;
  partnerId: string;
  userId: string;
  eventType: RatingEventType;
  points: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface RatingCalculation {
  partnerId: string;
  totalScore: number;
  tier: PartnerTier;
  factors: {
    dealQuality: number;
    engagement: number;
    certification: number;
    compliance: number;
    revenue: number;
  };
  calculatedAt: string;
}

// Form Types
export interface DealFormData {
  clientName: string;
  country: string;
  governmentLevel: GovernmentLevel;
  population: number;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone?: string;
  description: string;
  partnerGeneratedLead: boolean;
}

export interface QuoteFormData {
  sovraGovIncluded: boolean;
  sovraIdIncluded: boolean;
  sovraIdPlan: SovraIdPlan;
  walletImplementation: boolean;
  integrationHours: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Team Dashboard Types
export interface TeamMemberMetrics {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalRevenue: number;
  trainingCompletionRate: number;
  activeCertificationsCount: number;
}

export interface TeamMemberSummary {
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  certifications: Certification[];
  trainingProgress: Record<string, TrainingProgress>;
  deals: Deal[];
  metrics: TeamMemberMetrics;
}

// ============ Audit Log Types ============

export interface AuditLog {
  id: string;

  // Who
  actorId: string;
  actorName: string;
  actorType: 'sovra_admin' | 'partner' | 'system';

  // What
  action: AuditAction;
  entityType: 'partner' | 'deal' | 'credential' | 'document' | 'course' | 'pricing';
  entityId: string;
  entityName?: string;

  // Details
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;

  // When and where
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction =
  | 'partner.created'
  | 'partner.updated'
  | 'partner.suspended'
  | 'partner.reactivated'
  | 'partner.deleted'
  | 'partner.tier_changed'
  | 'credential.issued'
  | 'credential.revoked'
  | 'deal.approved'
  | 'deal.rejected'
  | 'deal.info_requested'
  | 'document.shared'
  | 'document.verified'
  | 'pricing.updated'
  | 'course.created'
  | 'course.updated'
  | 'course.published';

// ============ Partner Form Types ============

export interface PartnerFormData {
  companyName: string;
  country: string;
  tier: PartnerTier;
  logoUrl?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

// ============ Training Types (Enhanced) ============

export interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

export type ModuleType = 'video' | 'reading' | 'quiz' | 'download';
export type EnhancedCourseCategory = 'sales' | 'technical' | 'legal' | 'product';
export type CourseDifficulty = 'basic' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface EnhancedCourseModule {
  id: string;
  type: ModuleType;
  title: LocalizedString;
  description?: LocalizedString;
  content?: LocalizedString;
  duration: number;
  order: number;
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  passingScore?: number;
  maxAttempts?: number;
  randomizeQuestions?: boolean;
  showCorrectAnswers?: boolean;
}

export interface EnhancedTrainingCourse {
  id?: string;
  title: LocalizedString;
  description: LocalizedString;
  category: EnhancedCourseCategory;
  level: CourseDifficulty;
  estimatedHours: number;
  modules: EnhancedCourseModule[];
  hasCertification: boolean;
  status: CourseStatus;
  passingScore: number;
  certification?: {
    credentialName?: string;
    credentialDescription?: string;
    issuerName?: string;
    issuerEmail?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface CourseDetailedAnalytics {
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number;
  dropoffRates: Array<{ moduleId: string; moduleName: string; dropoffRate: number }>;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface ModuleProgress {
  moduleId: string;
  status: ProgressStatus;
  score?: number;
  startedAt?: string;
  completedAt?: string;
  attempts?: number;
  timeSpentMinutes?: number;
}

export interface EnhancedTrainingProgress {
  userId: string;
  courseId: string;
  status: ProgressStatus;
  moduleProgress: ModuleProgress[];
  overallScore: number;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  totalTimeSpentMinutes: number;
  certificateId?: string;
  certificateIssuedAt?: string;
}

export type CertificationStatus = 'issued' | 'claimed' | 'expired' | 'revoked';

export interface TrainingCertification {
  id: string;
  userId: string;
  courseId: string;
  courseName: LocalizedString;
  userName: string;
  userEmail: string;
  status: CertificationStatus;
  issuedAt: string;
  claimedAt?: string;
  expiresAt?: string;
  credentialUrl?: string;
  verificationCode: string;
  score: number;
}

export interface ModuleDropoffRate {
  moduleId: string;
  moduleName: string;
  dropoffRate: number;
}

export interface CredentialClaimAnalytics {
  totalIssued: number;
  totalClaimed: number;
  claimRate: number;
  averageClaimTimeHours: number;
  pending: number;
  expiringIn30Days: number;
}

export interface TrainingOverviewMetrics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  totalCertifications: number;
}
