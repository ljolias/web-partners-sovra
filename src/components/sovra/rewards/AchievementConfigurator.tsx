'use client';

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import type { RewardsConfig } from '@/lib/redis/rewards';

interface AchievementConfiguratorProps {
  config: RewardsConfig;
  onConfigUpdate: (config: RewardsConfig) => void;
}

export function AchievementConfigurator({
  config,
  onConfigUpdate,
}: AchievementConfiguratorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState(config);

  const handlePointsChange = (achievementId: string, points: number) => {
    setLocalConfig({
      ...localConfig,
      achievements: {
        ...localConfig.achievements,
        [achievementId]: {
          ...localConfig.achievements[achievementId],
          points,
        },
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch('/api/sovra/rewards/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      const result = await response.json();
      onConfigUpdate(result.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar la configuracion';
      setError(message);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const achievements = Object.values(localConfig.achievements);
  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Achievement Point Configuration
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryAchievements = achievements.filter((a) => a.category === category);
          return (
            <div key={category} className="border-t border-[var(--color-border)] pt-6 first:border-t-0 first:pt-0">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] capitalize mb-4">
                {category}
              </h3>

              <div className="grid gap-4">
                {categoryAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {achievement.name}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {achievement.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={achievement.points}
                          onChange={(e) =>
                            handlePointsChange(achievement.id, parseInt(e.target.value, 10))
                          }
                          className="w-20 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] text-center"
                        />
                        <span className="text-sm text-[var(--color-text-secondary)]">points</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          achievement.repeatable
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {achievement.repeatable ? 'Repeatable' : 'One-time'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <>
              <SovraLoader className="h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">Configuration saved successfully</span>
          </div>
        )}
      </div>
    </div>
  );
}
