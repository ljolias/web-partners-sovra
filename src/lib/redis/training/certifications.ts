/**
 * Training System Certification Management
 * Functions for managing training certifications and statistics
 */

import { redis } from '../client';
import { trainingKeys, CACHE_TTL } from './keys';
import { safeParseJSON, safeParseNumber } from './helpers';
import type { TrainingCertificationRecord } from './types';

/**
 * Get all training certifications
 * @returns Array of all certifications
 */
export async function getAllTrainingCertifications(): Promise<
  TrainingCertificationRecord[]
> {
  const certIds = await redis.smembers<string[]>(
    trainingKeys.allTrainingCertifications()
  );

  if (!certIds || certIds.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const id of certIds) {
    pipeline.hgetall(trainingKeys.trainingCertification(id));
  }

  const results = await pipeline.exec();
  const certifications: TrainingCertificationRecord[] = [];

  for (const result of results) {
    if (result && typeof result === 'object' && Object.keys(result).length > 0) {
      const cert = result as unknown as TrainingCertificationRecord;
      if (typeof cert.courseName === 'string') {
        cert.courseName = safeParseJSON(cert.courseName, { en: '' });
      }
      if (typeof cert.score === 'string') {
        cert.score = safeParseNumber(cert.score);
      }
      certifications.push(cert);
    }
  }

  return certifications;
}

/**
 * Get certification statistics
 */
export async function getCredentialStats(): Promise<{
  issued: number;
  claimed: number;
  pending: number;
  expired: number;
}> {
  const [issued, claimed, expired] = await Promise.all([
    redis.scard(trainingKeys.certificationsByStatus('issued')),
    redis.scard(trainingKeys.certificationsByStatus('claimed')),
    redis.scard(trainingKeys.certificationsByStatus('expired')),
  ]);

  const issuedCount = issued || 0;
  const claimedCount = claimed || 0;
  const pending = issuedCount > claimedCount ? issuedCount - claimedCount : 0;

  return {
    issued: issuedCount,
    claimed: claimedCount,
    pending,
    expired: expired || 0,
  };
}

/**
 * Issue a training certification
 * @param certification - The certification data
 */
export async function issueTrainingCertification(
  certification: TrainingCertificationRecord
): Promise<void> {
  const pipeline = redis.pipeline();

  pipeline.hset(trainingKeys.trainingCertification(certification.id), {
    ...certification,
    courseName: JSON.stringify(certification.courseName),
    score: certification.score.toString(),
  });

  pipeline.sadd(trainingKeys.allTrainingCertifications(), certification.id);
  pipeline.sadd(
    trainingKeys.certificationsByStatus(certification.status),
    certification.id
  );

  await pipeline.exec();

  // Invalidate caches
  await redis.del(trainingKeys.credentialAnalyticsCache());
  await redis.del(trainingKeys.overviewMetricsCache());
}

/**
 * Update certification status
 * @param certId - The certification ID
 * @param newStatus - The new status
 * @param updates - Additional fields to update
 */
export async function updateCertificationStatus(
  certId: string,
  newStatus: TrainingCertificationRecord['status'],
  updates?: { claimedAt?: string }
): Promise<void> {
  const certData = await redis.hgetall(trainingKeys.trainingCertification(certId));
  if (!certData) return;

  const oldStatus = certData.status as string;

  const pipeline = redis.pipeline();

  // Update the certification
  pipeline.hset(trainingKeys.trainingCertification(certId), {
    status: newStatus,
    ...(updates?.claimedAt && { claimedAt: updates.claimedAt }),
  });

  // Update status indexes
  if (oldStatus !== newStatus) {
    pipeline.srem(trainingKeys.certificationsByStatus(oldStatus), certId);
    pipeline.sadd(trainingKeys.certificationsByStatus(newStatus), certId);
  }

  await pipeline.exec();

  // Invalidate cache
  await redis.del(trainingKeys.credentialAnalyticsCache());
}
