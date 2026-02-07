import { redis } from './client';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';
import { TIER_REQUIREMENTS } from '@/lib/achievements/tiers';
import type { AchievementDefinition, TierRequirement, PartnerTier } from '@/types/achievements';

import { logger } from '@/lib/logger';
export interface RewardsConfig {
  achievements: Record<string, AchievementDefinition>;
  tierRequirements: Record<PartnerTier, TierRequirement>;
  lastUpdated: string;
  updatedBy?: string;
}

const REWARDS_CONFIG_KEY = 'rewards:config';
const REWARDS_CONFIG_HISTORY_KEY = (timestamp: string) => `rewards:config:history:${timestamp}`;
const CONFIG_HISTORY_TTL = 90 * 24 * 60 * 60; // 90 days

/**
 * Get current rewards configuration
 */
export async function getRewardsConfig(): Promise<RewardsConfig> {
  const stored = await redis.get(REWARDS_CONFIG_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(String(stored));
      return parsed as RewardsConfig;
    } catch (error) {
      logger.error('Failed to parse stored rewards config:', { error: error });
    }
  }

  // Return default config based on hardcoded definitions
  return {
    achievements: ACHIEVEMENTS,
    tierRequirements: TIER_REQUIREMENTS,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save rewards configuration and track history
 */
export async function saveRewardsConfig(
  config: RewardsConfig,
  updatedBy?: string
): Promise<void> {
  // Create versioned snapshot before saving
  const timestamp = new Date().toISOString();
  const configWithTimestamp = {
    ...config,
    lastUpdated: timestamp,
    updatedBy,
  };

  // Save current config as history
  const historyKey = REWARDS_CONFIG_HISTORY_KEY(timestamp);
  await redis.setex(historyKey, CONFIG_HISTORY_TTL, JSON.stringify(configWithTimestamp));

  // Save as current config
  await redis.set(REWARDS_CONFIG_KEY, JSON.stringify(configWithTimestamp));
}

/**
 * Get configuration history entries
 */
export async function getConfigHistory(limit = 20): Promise<RewardsConfig[]> {
  const keys = await redis.keys('rewards:config:history:*');
  if (!keys.length) return [];

  // Sort by timestamp descending (most recent first)
  const sortedKeys = keys.sort().reverse().slice(0, limit);

  const configs: RewardsConfig[] = [];
  for (const key of sortedKeys) {
    const data = await redis.get(key);
    if (data) {
      try {
        configs.push(JSON.parse(String(data)) as RewardsConfig);
      } catch (error) {
        logger.error('Failed to parse config history', { key, error });
      }
    }
  }

  return configs;
}

/**
 * Rollback to a previous configuration
 */
export async function rollbackConfig(targetTimestamp: string, updatedBy?: string): Promise<void> {
  const historyKey = REWARDS_CONFIG_HISTORY_KEY(targetTimestamp);
  const stored = await redis.get(historyKey);

  if (!stored) {
    throw new Error(`No configuration found for timestamp: ${targetTimestamp}`);
  }

  const config = JSON.parse(String(stored)) as RewardsConfig;
  await saveRewardsConfig(config, updatedBy);
}

/**
 * Record tier change in history
 */
export async function recordTierChange(
  partnerId: string,
  tier: PartnerTier,
  reason: 'achievement' | 'annual_renewal' | 'manual',
  previousTier?: PartnerTier
): Promise<void> {
  const key = `partner:${partnerId}:tier:history`;
  const entry = {
    tier,
    previousTier,
    changedAt: new Date().toISOString(),
    reason,
  };

  await redis.lpush(key, JSON.stringify(entry));
}

/**
 * Get tier change history for a partner
 */
export async function getTierHistory(partnerId: string, limit = 50) {
  const key = `partner:${partnerId}:tier:history`;
  const entries = (await redis.lrange(key, 0, limit - 1)) as string[] | null;

  if (!entries) return [];

  return entries
    .map((entry) => {
      try {
        return JSON.parse(String(entry));
      } catch (error) {
        logger.error('Failed to parse tier history entry:', { error: error });
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Get annual progress metrics for a partner
 */
export async function getAnnualProgress(partnerId: string) {
  const key = `partner:${partnerId}:annual:progress`;
  const data = await redis.hgetall(key);

  if (!data) {
    return {
      certifiedEmployees: 0,
      opportunities: 0,
      dealsWon: 0,
    };
  }

  return {
    certifiedEmployees: parseInt(String(data.certifiedEmployees || 0), 10),
    opportunities: parseInt(String(data.opportunities || 0), 10),
    dealsWon: parseInt(String(data.dealsWon || 0), 10),
  };
}
