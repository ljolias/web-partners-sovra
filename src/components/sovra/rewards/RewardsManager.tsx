'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementConfigurator } from './AchievementConfigurator';
import { TierRequirementsEditor } from './TierRequirementsEditor';
import { PartnerTierManager } from './PartnerTierManager';
import { AchievementAwardModal } from './AchievementAwardModal';
import type { RewardsConfig } from '@/lib/redis/rewards';
import { Settings, Users, Trophy } from 'lucide-react';

interface RewardsManagerProps {
  initialConfig: RewardsConfig;
}

export function RewardsManager({ initialConfig }: RewardsManagerProps) {
  const [activeTab, setActiveTab] = useState('configuration');
  const [config, setConfig] = useState(initialConfig);

  const handleConfigUpdate = (newConfig: RewardsConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1">
          <TabsTrigger
            value="configuration"
            className="flex items-center gap-2 data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
          <TabsTrigger
            value="partners"
            className="flex items-center gap-2 data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Partners</span>
          </TabsTrigger>
          <TabsTrigger
            value="awards"
            className="flex items-center gap-2 data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white"
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Awards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <AchievementConfigurator
              config={config}
              onConfigUpdate={handleConfigUpdate}
            />
            <TierRequirementsEditor
              config={config}
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        </TabsContent>

        <TabsContent value="partners" className="mt-6">
          <PartnerTierManager />
        </TabsContent>

        <TabsContent value="awards" className="mt-6">
          <AchievementAwardModal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
