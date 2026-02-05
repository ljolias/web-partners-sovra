import { z } from 'zod';

// Achievement definition schema
export const achievementDefinitionSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['certification', 'deals', 'training', 'compliance', 'engagement']),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  points: z.number().min(0).max(1000),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  repeatable: z.boolean(),
});

// Tier benefit schema
export const tierBenefitSchema = z.object({
  discount: z.number().min(0).max(100),
  features: z.array(z.string()),
});

// Tier requirement schema
export const tierRequirementSchema = z.object({
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  minRating: z.number().min(0),
  achievements: z.object({
    required: z.array(z.string()),
    optional: z.array(z.string()),
  }),
  annualRequirements: z.object({
    certifiedEmployees: z.number().min(0),
    opportunities: z.number().min(0),
    dealsWon: z.number().min(0),
  }),
  benefits: tierBenefitSchema,
});

// Full rewards config schema
export const rewardsConfigSchema = z.object({
  achievements: z.record(z.string(), achievementDefinitionSchema),
  tierRequirements: z.record(z.string(), tierRequirementSchema),
  lastUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
});

// Manual tier change schema
export const manualTierChangeSchema = z.object({
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  skipRequirements: z.boolean().optional().default(false),
});

// Manual achievement award schema
export const manualAchievementAwardSchema = z.object({
  achievementId: z.string().min(1),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  date: z.string().datetime().optional(),
});

// Achievement revoke schema
export const manualAchievementRevokeSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});
