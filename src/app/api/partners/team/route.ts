import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/auth';
import {
  getPartnerUsers,
  getUserCertifications,
  getUserTrainingProgress,
  getPartnerDeals,
  getAllTrainingModules,
} from '@/lib/redis';
import type { TeamMemberSummary } from '@/types';

export async function GET() {
  const result = await checkPermission('team:view');

  if (!result.authorized) {
    return result.response;
  }

  const { sessionData } = result;

  try {
    // Get all users for this partner
    const users = await getPartnerUsers(sessionData.partner.id);

    // Get all partner deals once
    const allDeals = await getPartnerDeals(sessionData.partner.id);

    // Get all training modules for calculating completion rate
    const allModules = await getAllTrainingModules();
    const totalModules = allModules.length;

    // Build team member summaries
    const teamMembers: TeamMemberSummary[] = await Promise.all(
      users.map(async (user) => {
        const [certifications, trainingProgress] = await Promise.all([
          getUserCertifications(user.id),
          getUserTrainingProgress(user.id),
        ]);

        // Filter deals created by this user
        const userDeals = allDeals.filter((deal) => deal.createdBy === user.id);

        // Calculate metrics
        const totalDeals = userDeals.length;
        const activeDeals = userDeals.filter(
          (d) => !['closed_won', 'closed_lost'].includes(d.stage)
        ).length;
        const wonDeals = userDeals.filter((d) => d.stage === 'closed_won').length;
        const totalRevenue = userDeals
          .filter((d) => d.stage === 'closed_won')
          .reduce((sum, d) => sum + d.dealValue, 0);

        // Calculate training completion rate
        const completedModules = Object.values(trainingProgress).filter(
          (p) => p.completed
        ).length;
        const trainingCompletionRate =
          totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // Count active certifications
        const activeCertificationsCount = certifications.filter(
          (c) => c.status === 'active' && new Date(c.expiresAt) > new Date()
        ).length;

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          certifications,
          trainingProgress,
          deals: userDeals,
          metrics: {
            totalDeals,
            activeDeals,
            wonDeals,
            totalRevenue,
            trainingCompletionRate,
            activeCertificationsCount,
          },
        };
      })
    );

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
