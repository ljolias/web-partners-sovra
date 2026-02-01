'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui';
import { calculateMEDDICAverage, cn } from '@/lib/utils';
import type { MEDDICScores } from '@/types';

interface MEDDICDisplayProps {
  scores: MEDDICScores;
  showLabels?: boolean;
  interactive?: boolean;
  onScoreClick?: (category: keyof MEDDICScores) => void;
}

export function MEDDICDisplay({
  scores,
  showLabels = true,
  interactive = false,
  onScoreClick,
}: MEDDICDisplayProps) {
  const t = useTranslations('meddic');

  const categories: { key: keyof MEDDICScores; color: string }[] = [
    { key: 'metrics', color: 'bg-blue-500' },
    { key: 'economicBuyer', color: 'bg-purple-500' },
    { key: 'decisionCriteria', color: 'bg-indigo-500' },
    { key: 'decisionProcess', color: 'bg-cyan-500' },
    { key: 'identifyPain', color: 'bg-rose-500' },
    { key: 'champion', color: 'bg-amber-500' },
  ];

  const average = calculateMEDDICAverage(scores);

  const getVariant = (score: number): 'default' | 'success' | 'warning' | 'danger' => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'default';
    if (score >= 2) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900">{average.toFixed(1)}</div>
        <div className="text-sm text-gray-500">{t('overall')}</div>
        <Progress value={average} max={5} className="mt-2" variant={getVariant(average)} />
      </div>

      {/* Individual Scores */}
      <div className="space-y-4">
        {categories.map(({ key, color }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-lg p-3',
              interactive && 'cursor-pointer hover:bg-gray-50'
            )}
            onClick={() => interactive && onScoreClick?.(key)}
          >
            <div className="flex items-center justify-between mb-2">
              {showLabels && (
                <span className="text-sm font-medium text-gray-700">{t(key)}</span>
              )}
              <span className="text-sm font-semibold text-gray-900">{scores[key]}/5</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(scores[key] / 5) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={cn('h-full rounded-full', color)}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
