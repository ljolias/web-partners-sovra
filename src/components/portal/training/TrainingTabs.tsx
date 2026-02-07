import React from 'react';
import { GraduationCap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'modules' | 'certifications';

interface TrainingTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  modulesLabel: string;
  certificationsLabel: string;
}

export const TrainingTabs = React.memo(function TrainingTabs({
  activeTab,
  onTabChange,
  modulesLabel,
  certificationsLabel,
}: TrainingTabsProps) {
  const tabs = React.useMemo(
    () => [
      { id: 'modules' as TabType, label: modulesLabel, icon: GraduationCap },
      {
        id: 'certifications' as TabType,
        label: certificationsLabel,
        icon: Award,
      },
    ],
    [modulesLabel, certificationsLabel]
  );

  return (
    <div className="flex gap-2 border-b border-[var(--color-border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
});
