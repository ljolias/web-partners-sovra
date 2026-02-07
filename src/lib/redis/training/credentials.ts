/**
 * Training System Credential Claim Analytics
 * Functions for analyzing credential claim patterns and metrics
 */

import { redis } from '../client';
import { trainingKeys, CACHE_TTL } from './keys';
import { calculatePercentage, safeParseJSON } from './helpers';
import { getAllTrainingCertifications } from './certifications';
import type { CredentialClaimAnalytics } from './types';

/**
 * Get credential claim analytics
 * Includes total issued, claimed, claim rate, average claim time,
 * pending count, and expiring soon count
 *
 * @returns Credential claim analytics
 */
export async function getCredentialClaimAnalytics(): Promise<CredentialClaimAnalytics> {
  // Check cache first
  const cached = await redis.get(trainingKeys.credentialAnalyticsCache());
  if (cached) {
    const cachedData = safeParseJSON<CredentialClaimAnalytics | null>(
      typeof cached === 'string' ? cached : JSON.stringify(cached),
      null
    );
    if (cachedData) {
      return cachedData;
    }
  }

  // Get all certifications for detailed analysis
  const certifications = await getAllTrainingCertifications();

  const totalIssued = certifications.length;
  let totalClaimed = 0;
  let totalClaimTimeHours = 0;
  let claimTimeCount = 0;
  let expiringIn30Days = 0;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const cert of certifications) {
    // Count claimed
    if (cert.status === 'claimed' || cert.claimedAt) {
      totalClaimed++;

      // Calculate claim time
      if (cert.issuedAt && cert.claimedAt) {
        const issued = new Date(cert.issuedAt).getTime();
        const claimed = new Date(cert.claimedAt).getTime();
        if (!isNaN(issued) && !isNaN(claimed) && claimed > issued) {
          totalClaimTimeHours += (claimed - issued) / (1000 * 60 * 60);
          claimTimeCount++;
        }
      }
    }

    // Count expiring soon
    if (cert.expiresAt) {
      const expires = new Date(cert.expiresAt);
      if (expires > now && expires <= thirtyDaysFromNow) {
        expiringIn30Days++;
      }
    }
  }

  const pending = totalIssued - totalClaimed;

  const analytics: CredentialClaimAnalytics = {
    totalIssued,
    totalClaimed,
    claimRate: calculatePercentage(totalClaimed, totalIssued),
    averageClaimTimeHours:
      claimTimeCount > 0
        ? Math.round((totalClaimTimeHours / claimTimeCount) * 10) / 10
        : 0,
    pending: pending > 0 ? pending : 0,
    expiringIn30Days,
  };

  // Cache the results
  await redis.set(
    trainingKeys.credentialAnalyticsCache(),
    JSON.stringify(analytics),
    { ex: CACHE_TTL.CREDENTIALS }
  );

  return analytics;
}
