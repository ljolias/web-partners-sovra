import { redis } from '@/lib/redis/client';
import { ACHIEVEMENTS, getAchievementsByCategory } from './definitions';
import type { Achievement, AchievementProgress } from '@/types/achievements';

const ACHIEVEMENT_KEY_PREFIX = 'partner:achievements';

/**
 * Award an achievement to a partner if they haven't already earned it
 * For repeatable achievements, allows multiple awards with unique identifiers
 */
export async function checkAndAwardAchievement(
  partnerId: string,
  achievementId: string,
): Promise<boolean> {
  const definition = ACHIEVEMENTS[achievementId];
  if (!definition) {
    console.warn(`Achievement not found: ${achievementId}`);
    return false;
  }

  const key = `${ACHIEVEMENT_KEY_PREFIX}:${partnerId}`;

  if (definition.repeatable) {
    // For repeatable achievements, count how many times they've earned it
    const achievements = await redis.hgetall(key);
    const count = achievements ? Object.keys(achievements).filter((k) =>
      k.startsWith(`${achievementId}_`),
    ).length : 0;

    // Award with a numeric suffix
    const awardKey = `${achievementId}_${count + 1}`;
    const now = new Date().toISOString();
    await redis.hset(key, { [awardKey]: now });
    return true;
  } else {
    // For non-repeatable achievements, check if already earned
    const alreadyEarned = await redis.hexists(key, achievementId);
    if (alreadyEarned) {
      return false;
    }

    const now = new Date().toISOString();
    await redis.hset(key, { [achievementId]: now });
    return true;
  }
}

/**
 * Get all achievements earned by a partner
 */
export async function getPartnerAchievements(
  partnerId: string,
): Promise<Achievement[]> {
  const key = `${ACHIEVEMENT_KEY_PREFIX}:${partnerId}`;
  const earnedData = await redis.hgetall(key);

  const achievements: Achievement[] = [];

  if (!earnedData) {
    return achievements;
  }

  // Group earned achievements by ID (handling repeatable achievements)
  const earnedMap: Record<string, string[]> = {};
  for (const [earnedId, completedAtValue] of Object.entries(earnedData)) {
    const completedAt = typeof completedAtValue === 'string' ? completedAtValue : String(completedAtValue);
    // Extract base achievement ID (strip numeric suffix for repeatable achievements)
    const baseId = earnedId.replace(/_\d+$/, '');
    if (!earnedMap[baseId]) {
      earnedMap[baseId] = [];
    }
    earnedMap[baseId].push(completedAt);
  }

  // Build achievements list
  for (const [baseId, completedDates] of Object.entries(earnedMap)) {
    const definition = ACHIEVEMENTS[baseId];
    if (!definition) continue;

    // For repeatable achievements, create an entry for each earned instance
    if (definition.repeatable) {
      for (const completedAt of completedDates) {
        achievements.push({
          ...definition,
          completedAt,
        });
      }
    } else {
      // For non-repeatable, use the first (and only) completion date
      achievements.push({
        ...definition,
        completedAt: completedDates[0],
      });
    }
  }

  return achievements;
}

/**
 * Get progress by category
 */
export async function getAchievementProgressByCategory(
  partnerId: string,
  category: string,
): Promise<AchievementProgress> {
  const earnedAchievements = await getPartnerAchievements(partnerId);
  const categoryAchievements = getAchievementsByCategory(category);

  const earnedIds = new Set(
    earnedAchievements.map((a) => a.id),
  );

  const completed = categoryAchievements.filter((a) => earnedIds.has(a.id));
  const total = categoryAchievements.length;

  return {
    category: category as any,
    total,
    completed: completed.length,
    percentage: total === 0 ? 0 : Math.round((completed.length / total) * 100),
    achievements: categoryAchievements.map((def) => ({
      ...def,
      completedAt: earnedAchievements.find((a) => a.id === def.id)?.completedAt,
    })),
  };
}

/**
 * Check if a partner has earned a specific achievement
 */
export async function hasAchievement(
  partnerId: string,
  achievementId: string,
): Promise<boolean> {
  const key = `${ACHIEVEMENT_KEY_PREFIX}:${partnerId}`;
  const exists = await redis.hexists(key, achievementId);
  return exists === 1;
}

/**
 * Get count of specific achievement earned by partner
 * Useful for achievements with numeric requirements (e.g., "certify X employees")
 */
export async function getAchievementCount(
  partnerId: string,
  achievementId: string,
): Promise<number> {
  const key = `${ACHIEVEMENT_KEY_PREFIX}:${partnerId}`;
  const earnedData = await redis.hgetall(key);

  if (!earnedData) {
    return 0;
  }

  // Count entries matching the achievement ID
  let count = 0;
  for (const earnedId of Object.keys(earnedData)) {
    const baseId = earnedId.replace(/_\d+$/, '');
    if (baseId === achievementId) {
      count++;
    }
  }

  return count;
}

/**
 * Remove an achievement (for testing or manual adjustments)
 */
export async function removeAchievement(
  partnerId: string,
  achievementId: string,
): Promise<boolean> {
  const key = `${ACHIEVEMENT_KEY_PREFIX}:${partnerId}`;
  const result = await redis.hdel(key, achievementId);
  return (result as unknown as number) > 0;
}

/**
 * Clear all achievements for a partner (for testing)
 */
export async function clearAllAchievements(partnerId: string): Promise<void> {
  const key = `${ACHIEVEMENT_KEY_PREFIX}:${partnerId}`;
  await redis.del(key);
}
