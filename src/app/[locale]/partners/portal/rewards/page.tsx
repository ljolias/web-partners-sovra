'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { SovraLoader } from '@/components/ui/SovraLoader';
import { Button } from '@/components/ui/button';
import { TierHeader } from '@/components/portal/achievements/TierHeader';
import { TierRoadmap } from '@/components/portal/achievements/TierRoadmap';
import { NextTierCard } from '@/components/portal/achievements/NextTierCard';
import { AnnualRenewalCard } from '@/components/portal/achievements/AnnualRenewalCard';
import { BonusAchievements } from '@/components/portal/achievements/BonusAchievements';
import { AchievementCard } from '@/components/portal/achievements/AchievementCard';
import { AchievementProgress } from '@/components/portal/achievements/AchievementProgress';
import { HowToEarnPoints } from '@/components/portal/achievements/HowToEarnPoints';
import {
  getAchievementsByCategory,
  getAllAchievements,
  checkAnnualRenewal,
} from '@/lib/achievements';
import type {
  Achievement,
  AchievementProgress as AchievementProgressType,
  NextTierRequirements,
  PartnerTier,
  RenewalStatus,
} from '@/types/achievements';

interface PageState {
  partner: { tier: PartnerTier };
  achievements: Achievement[];
  totalPoints: number;
  nextTierRequirements: NextTierRequirements | null;
  renewalStatus: RenewalStatus | null;
  progressByCategory: Record<string, AchievementProgressType>;
  loading: boolean;
  error: string | null;
}

export default function RewardsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'achievements' | 'progress'>('achievements');
  const [state, setState] = useState<PageState>({
    partner: { tier: 'bronze' },
    achievements: [],
    totalPoints: 0,
    nextTierRequirements: null,
    renewalStatus: null,
    progressByCategory: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        // Fetch achievements
        const achievementsRes = await fetch('/api/partners/achievements');
        if (!achievementsRes.ok) throw new Error('Failed to fetch achievements');
        const achievementsData = await achievementsRes.json();

        // Fetch progress
        const progressRes = await fetch('/api/partners/achievements/progress');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');
        const progressData = await progressRes.json();

        // Calculate progress by category
        const categories = [
          'certification',
          'deals',
          'training',
          'compliance',
          'engagement',
        ];
        const progressByCategory: Record<string, AchievementProgressType> = {};

        for (const category of categories) {
          const categoryAchievements = getAchievementsByCategory(category);
          const earnedIds = new Set(achievementsData.achievements.map((a: Achievement) => a.id));

          const completed = categoryAchievements.filter((a) =>
            earnedIds.has(a.id),
          );

          progressByCategory[category] = {
            category: category as any,
            total: categoryAchievements.length,
            completed: completed.length,
            percentage:
              categoryAchievements.length === 0
                ? 0
                : Math.round((completed.length / categoryAchievements.length) * 100),
            achievements: categoryAchievements,
          };
        }

        setState({
          partner: progressData.currentTier ? { tier: progressData.currentTier } : { tier: 'bronze' },
          achievements: achievementsData.achievements,
          totalPoints: achievementsData.totalPoints,
          nextTierRequirements: progressData.progress,
          renewalStatus: null,
          progressByCategory,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    };

    loadData();
  }, []);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SovraLoader />
      </div>
    );
  }

  const bonusAchievements = getAllAchievements().filter((a) => a.repeatable);
  const earnedIds = new Set(state.achievements.map((a) => a.id));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('navigation.rewards')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('rewards.page_description')}
        </p>
      </div>

      {/* Tier Header */}
      <TierHeader
        currentTier={state.partner.tier}
        totalPoints={state.totalPoints}
      />

      {/* Tier Roadmap */}
      <TierRoadmap
        currentTier={state.partner.tier}
        nextTier={state.nextTierRequirements?.tier || null}
      />

      {/* How to Earn Points Section */}
      <section className="py-6">
        <HowToEarnPoints />
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('rewards.achievements')}
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'progress'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('rewards.progress')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'achievements' && (
          <>
            {Object.entries(state.progressByCategory).map(([category, progress]) => (
              <div key={category} className="space-y-4">
                <AchievementProgress progress={progress} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {progress.achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      earned={earnedIds.has(achievement.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'progress' && (
          <>
            {/* Next Tier Requirements */}
            <NextTierCard requirements={state.nextTierRequirements} />

            {/* Annual Renewal */}
            {state.renewalStatus && (
              <AnnualRenewalCard status={state.renewalStatus} />
            )}

            {/* Bonus Achievements */}
            <BonusAchievements
              opportunities={bonusAchievements}
              earnedIds={earnedIds}
            />
          </>
        )}
      </div>
    </div>
  );
}
