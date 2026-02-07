/**
 * Training System Type Definitions
 * All interfaces and types used across training analytics modules
 */

import type { LocalizedString } from '@/types';

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

export interface EnhancedTrainingProgress {
  userId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  moduleProgress: ModuleProgress[];
  overallScore: number;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  totalTimeSpentMinutes: number;
  certificateId?: string;
  certificateIssuedAt?: string;
}

export interface ModuleProgress {
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  startedAt?: string;
  completedAt?: string;
  attempts?: number;
  timeSpentMinutes?: number;
}

export interface TrainingCertificationRecord {
  id: string;
  userId: string;
  courseId: string;
  courseName: LocalizedString;
  userName: string;
  userEmail: string;
  status: 'issued' | 'claimed' | 'expired' | 'revoked';
  issuedAt: string;
  claimedAt?: string;
  expiresAt?: string;
  credentialUrl?: string;
  verificationCode: string;
  score: number;
}
