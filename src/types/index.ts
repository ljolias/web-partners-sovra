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
  role: 'admin' | 'sales' | 'viewer';
  passwordHash: string;
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

// Deal Types
export interface Deal {
  id: string;
  partnerId: string;
  companyName: string;
  companyDomain: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dealValue: number;
  currency: 'USD' | 'EUR' | 'BRL';
  stage: DealStage;
  notes: string;
  meddic: MEDDICScores;
  exclusivityExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | 'registered'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

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
  companyName: string;
  companyDomain: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dealValue: number;
  currency: 'USD' | 'EUR' | 'BRL';
  notes: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
