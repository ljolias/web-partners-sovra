// User Role Types
export type UserRole = 'admin' | 'sales' | 'viewer' | 'sovra_admin';

// Partner Types
export interface Partner {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  tier: PartnerTier;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  certifications: string[];
  legalDocsSignedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PartnerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

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

// Training Types
export interface TrainingModule {
  id: string;
  title: Record<string, string>; // locale -> title
  description: Record<string, string>;
  content: Record<string, string>;
  duration: number; // minutes
  order: number;
  quiz: QuizQuestion[];
  passingScore: number; // percentage
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: Record<string, string>;
  options: Record<string, string[]>;
  correctAnswer: number;
}

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

// Legal Types
export interface LegalDocument {
  id: string;
  type: 'nda' | 'partner_agreement' | 'data_processing';
  version: string;
  title: Record<string, string>;
  content: Record<string, string>;
  requiredForDeals: boolean;
  createdAt: string;
}

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
