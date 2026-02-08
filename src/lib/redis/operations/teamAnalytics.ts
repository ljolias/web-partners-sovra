import { redis } from '../client';
import { keys } from '../keys';
import type { User, Deal, TrainingCourse } from '@/types';
import { getPartnerUsers } from './users';
import { getPartnerDeals } from './deals';
import { getUserCertifications } from './certifications';
import { getAchievements } from './achievements';

/**
 * Team Performance Metrics
 */
export interface TeamPerformance {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  teamSize: number;
  certifiedMembers: number;
  totalCertifications: number;
  totalAchievements: number;
}

/**
 * Individual Team Member Performance
 */
export interface TeamMemberPerformance {
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  deals: number;
  wonDeals: number;
  revenue: number;
  certifications: number;
  achievements: number;
  trainingProgress: number; // percentage
}

/**
 * Team Leaderboard Entry
 */
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  value: number;
  label: string;
}

/**
 * Get aggregated team performance metrics
 */
export async function getTeamPerformance(partnerId: string): Promise<TeamPerformance> {
  // Get all team members
  const teamMembers = await getPartnerUsers(partnerId);

  // Get all partner deals
  const allDeals = await getPartnerDeals(partnerId);

  // Calculate metrics
  const activeDeals = allDeals.filter(d =>
    d.status !== 'closed_won' && d.status !== 'closed_lost' && d.status !== 'rejected'
  ).length;

  const wonDeals = allDeals.filter(d => d.status === 'closed_won').length;
  const lostDeals = allDeals.filter(d => d.status === 'closed_lost').length;

  // Note: Deal doesn't have estimatedValue field
  // Revenue would need to be calculated from associated quotes
  // For now, we'll set it to 0
  const totalRevenue = 0;

  // Get certifications for all team members
  let totalCertifications = 0;
  let certifiedMembers = 0;

  for (const member of teamMembers) {
    const certs = await getUserCertifications(member.id);

    if (certs.length > 0) {
      certifiedMembers++;
      totalCertifications += certs.length;
    }
  }

  // Get partner achievements (achievements are per partner, not per user)
  const achievements = await getAchievements(partnerId);
  const totalAchievements = Object.keys(achievements).length;

  return {
    totalDeals: allDeals.length,
    activeDeals,
    wonDeals,
    lostDeals,
    totalRevenue,
    teamSize: teamMembers.length,
    certifiedMembers,
    totalCertifications,
    totalAchievements,
  };
}

/**
 * Get performance metrics for each team member
 */
export async function getTeamMembersPerformance(partnerId: string): Promise<TeamMemberPerformance[]> {
  const teamMembers = await getPartnerUsers(partnerId);
  const allDeals = await getPartnerDeals(partnerId);

  const performances: TeamMemberPerformance[] = [];

  for (const member of teamMembers) {
    // Get deals for this user
    const userDeals = allDeals.filter(d => d.createdBy === member.id);
    const wonDeals = userDeals.filter(d => d.status === 'closed_won');
    // Note: Revenue would need to be calculated from associated quotes
    // For now, we'll set it to 0
    const revenue = 0;

    // Get certifications
    const certifications = await getUserCertifications(member.id);

    // Calculate training progress (simplified - based on certifications)
    // In a real scenario, this would look at completed modules vs total modules
    const trainingProgress = certifications.length > 0 ? 100 : 0;

    // Note: Achievements are tracked at partner level, not per user
    // So we show 0 for individual members
    performances.push({
      userId: member.id,
      userName: member.name,
      userEmail: member.email,
      avatarUrl: member.avatarUrl,
      deals: userDeals.length,
      wonDeals: wonDeals.length,
      revenue,
      certifications: certifications.length,
      achievements: 0, // Achievements are per partner, not per user
      trainingProgress,
    });
  }

  return performances;
}

/**
 * Get top performers by deals
 */
export async function getTopPerformersByDeals(
  partnerId: string,
  limit: number = 5
): Promise<LeaderboardEntry[]> {
  const performances = await getTeamMembersPerformance(partnerId);

  return performances
    .sort((a, b) => b.deals - a.deals)
    .slice(0, limit)
    .map(p => ({
      userId: p.userId,
      userName: p.userName,
      avatarUrl: p.avatarUrl,
      value: p.deals,
      label: `${p.deals} deal${p.deals !== 1 ? 's' : ''}`,
    }));
}

/**
 * Get top performers by revenue
 */
export async function getTopPerformersByRevenue(
  partnerId: string,
  limit: number = 5
): Promise<LeaderboardEntry[]> {
  const performances = await getTeamMembersPerformance(partnerId);

  return performances
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(p => ({
      userId: p.userId,
      userName: p.userName,
      avatarUrl: p.avatarUrl,
      value: p.revenue,
      label: `$${p.revenue.toLocaleString()}`,
    }));
}

/**
 * Get top performers by certifications
 */
export async function getTopPerformersByCertifications(
  partnerId: string,
  limit: number = 5
): Promise<LeaderboardEntry[]> {
  const performances = await getTeamMembersPerformance(partnerId);

  return performances
    .sort((a, b) => b.certifications - a.certifications)
    .slice(0, limit)
    .map(p => ({
      userId: p.userId,
      userName: p.userName,
      avatarUrl: p.avatarUrl,
      value: p.certifications,
      label: `${p.certifications} cert${p.certifications !== 1 ? 's' : ''}`,
    }));
}

/**
 * Get top performers by achievements
 * Note: Currently returns empty as achievements are tracked per partner, not per user
 */
export async function getTopPerformersByAchievements(
  partnerId: string,
  limit: number = 5
): Promise<LeaderboardEntry[]> {
  // Achievements are tracked at partner level, not per user
  // This function is kept for API compatibility but returns empty array
  return [];
}
