import { redis } from '@/lib/redis/client';
import { keys } from '@/lib/redis/keys';
import type { RatingEvent, RatingEventType } from '@/types';
import { checkAndAwardAchievement, getAchievementCount, incrementAnnualMetric } from '@/lib/achievements';
import { generateId } from '@/lib/redis/operations/helpers';
import { logger } from '@/lib/logger';

// Points awarded/deducted for each event type
export const EVENT_POINTS: Record<RatingEventType, number> = {
  COPILOT_SESSION_COMPLETED: 2,
  TRAINING_MODULE_COMPLETED: 3,
  CERTIFICATION_EARNED: 10,
  DEAL_CLOSED_WON: 15,
  MEDDIC_SCORE_IMPROVED: 1,
  DEAL_CLOSED_LOST_POOR_QUALIFICATION: -10,
  CERTIFICATION_EXPIRED: -5,
  LEGAL_EXPIRED: -8,
  DEAL_STALE_30_DAYS: -3,
  LOGIN_INACTIVE_30_DAYS: -2,
};

/**
 * Process achievement awards based on rating events
 * This is called after logging rating events
 */
async function processAchievementsForEvent(
  partnerId: string,
  eventType: RatingEventType
): Promise<void> {
  try {
    switch (eventType) {
      case 'CERTIFICATION_EARNED': {
        // Award certification achievements
        const certCount = await getAchievementCount(partnerId, 'first_certification');

        if (certCount === 0) {
          await checkAndAwardAchievement(partnerId, 'first_certification');
        } else if (certCount === 1) {
          await checkAndAwardAchievement(partnerId, 'second_certification');
        } else if (certCount === 2) {
          await checkAndAwardAchievement(partnerId, 'third_certification');
        }

        // Increment annual certification counter
        await incrementAnnualMetric(partnerId, 'certifications', 1);
        break;
      }

      case 'DEAL_CLOSED_WON': {
        // Award deal achievements
        const dealsWonCount = await getAchievementCount(partnerId, 'first_deal_won');

        if (dealsWonCount === 0) {
          await checkAndAwardAchievement(partnerId, 'first_deal_won');
        } else if (dealsWonCount === 1) {
          await checkAndAwardAchievement(partnerId, 'two_deals_won');
        }

        // Increment annual deals won counter
        await incrementAnnualMetric(partnerId, 'deals_won', 1);
        break;
      }

      case 'TRAINING_MODULE_COMPLETED': {
        // Award training achievements
        await checkAndAwardAchievement(partnerId, 'training_module_complete');
        break;
      }
    }
  } catch (error) {
    logger.error('Error processing achievements for event:', { error: error });
    // Don't throw - we don't want achievement processing to block rating event logging
  }
}

/**
 * Log a rating event for a partner
 */
export async function logRatingEvent(
  partnerId: string,
  userId: string,
  eventType: RatingEventType,
  metadata?: Record<string, unknown>
): Promise<RatingEvent> {
  const event: RatingEvent = {
    id: generateId(),
    partnerId,
    userId,
    eventType,
    points: EVENT_POINTS[eventType],
    metadata,
    createdAt: new Date().toISOString(),
  };

  // Store event in a sorted set by timestamp
  await redis.zadd(keys.ratingEvents(partnerId), {
    score: new Date(event.createdAt).getTime(),
    member: JSON.stringify(event),
  });

  // Process achievement awards based on event type
  // Run in background to avoid blocking the response
  processAchievementsForEvent(partnerId, eventType).catch((error) => {
    logger.error('Background achievement processing error:', { error: error });
  });

  return event;
}

/**
 * Get all rating events for a partner
 */
export async function getPartnerEvents(
  partnerId: string,
  limit = 100
): Promise<RatingEvent[]> {
  const events = await redis.zrange<string[]>(
    keys.ratingEvents(partnerId),
    0,
    limit - 1,
    { rev: true }
  );

  return events.map((e) => (typeof e === 'string' ? JSON.parse(e) : e));
}

/**
 * Get events within a specific time range
 */
export async function getPartnerEventsInRange(
  partnerId: string,
  startDate: Date,
  endDate: Date
): Promise<RatingEvent[]> {
  const events = await redis.zrange<string[]>(
    keys.ratingEvents(partnerId),
    startDate.getTime(),
    endDate.getTime(),
    { byScore: true }
  );

  return events.map((e: string) => (typeof e === 'string' ? JSON.parse(e) : e));
}

/**
 * Update the partner's last login timestamp
 */
export async function updatePartnerLastLogin(partnerId: string): Promise<void> {
  await redis.set(keys.partnerLastLogin(partnerId), new Date().toISOString());
}

/**
 * Get the partner's last login timestamp
 */
export async function getPartnerLastLogin(partnerId: string): Promise<string | null> {
  return redis.get<string>(keys.partnerLastLogin(partnerId));
}
