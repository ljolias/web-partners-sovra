/**
 * Training System Types
 * Type definitions for the Training Center functionality
 */

// ============================================================================
// MULTI-LANGUAGE SUPPORT
// ============================================================================

export interface MultiLangText {
  en: string;
  es?: string;
  pt?: string;
}

// ============================================================================
// MODULE TYPES
// ============================================================================

export type ModuleType = 'video' | 'reading' | 'quiz' | 'download';

export interface BaseModule {
  id: string;
  type: ModuleType;
  title: MultiLangText;
  description?: MultiLangText;
  order: number;
  estimatedMinutes?: number;
}

export interface VideoModule extends BaseModule {
  type: 'video';
  videoUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
  transcript?: MultiLangText;
}

export interface ReadingModule extends BaseModule {
  type: 'reading';
  content: MultiLangText;
}

export interface QuizQuestion {
  id: string;
  question: MultiLangText;
  options: MultiLangText[];
  correctOptionIndex: number;
  explanation?: MultiLangText;
}

export interface QuizModule extends BaseModule {
  type: 'quiz';
  questions: QuizQuestion[];
  passingScore: number; // 0-100
  allowRetries: boolean;
  maxRetries?: number;
}

export interface DownloadModule extends BaseModule {
  type: 'download';
  files: {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
}

export type TrainingModule =
  | VideoModule
  | ReadingModule
  | QuizModule
  | DownloadModule;

// ============================================================================
// COURSE TYPES
// ============================================================================

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory =
  | 'product'
  | 'sales'
  | 'technical'
  | 'compliance'
  | 'onboarding';

export interface EnhancedTrainingCourse {
  id: string;
  title: MultiLangText;
  description: MultiLangText;
  shortDescription?: MultiLangText;
  thumbnailUrl?: string;
  status: CourseStatus;
  level: CourseLevel;
  category: CourseCategory;
  tags: string[];
  modules: TrainingModule[];
  estimatedDurationMinutes: number;
  passingScore: number; // 0-100, minimum score to pass
  hasCertification: boolean;
  certificationName?: MultiLangText;
  certificationValidityDays?: number;
  prerequisiteCourseIds: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: string;
  updatedBy: string;
}

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface ModuleProgress {
  moduleId: string;
  status: ProgressStatus;
  score?: number; // For quiz modules
  startedAt?: string;
  completedAt?: string;
  attempts?: number; // For quiz modules
  timeSpentMinutes?: number;
}

export interface EnhancedTrainingProgress {
  userId: string;
  courseId: string;
  status: ProgressStatus;
  moduleProgress: ModuleProgress[];
  overallScore: number; // 0-100
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  totalTimeSpentMinutes: number;
  certificateId?: string;
  certificateIssuedAt?: string;
}

// ============================================================================
// CERTIFICATION TYPES
// ============================================================================

export type CertificationStatus = 'issued' | 'claimed' | 'expired' | 'revoked';

export interface TrainingCertification {
  id: string;
  userId: string;
  courseId: string;
  courseName: MultiLangText;
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

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ModuleDropoffRate {
  moduleId: string;
  moduleName: string;
  dropoffRate: number; // Percentage of users who started but didn't complete
}

export interface CourseDetailedAnalytics {
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number; // hours
  dropoffRates: ModuleDropoffRate[];
}

export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD
  count: number;
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

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TrainingApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
