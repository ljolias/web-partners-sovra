'use client';

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Trash2, Plus, Edit2, X } from 'lucide-react';
import { SovraLoader } from '@/components/ui';
import type { RewardsConfig } from '@/lib/redis/rewards';
import type { PartnerTier } from '@/types';
import type { AchievementCategory } from '@/types/achievements';

interface AchievementConfiguratorProps {
  config: RewardsConfig;
  onConfigUpdate: (config: RewardsConfig) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  certification: 'Certificaciones',
  deals: 'Oportunidades',
  training: 'Capacitacion',
  compliance: 'Cumplimiento',
  engagement: 'Participacion',
};

const TIERS: PartnerTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export function AchievementConfigurator({
  config,
  onConfigUpdate,
}: AchievementConfiguratorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState(config);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAchievementForm, setNewAchievementForm] = useState(false);

  const handleAchievementChange = (
    achievementId: string,
    field: string,
    value: unknown
  ) => {
    const achievement = localConfig.achievements[achievementId];
    setLocalConfig({
      ...localConfig,
      achievements: {
        ...localConfig.achievements,
        [achievementId]: {
          ...achievement,
          [field]: value,
        },
      },
    });
  };

  const handleDeleteAchievement = (achievementId: string) => {
    const newAchievements = { ...localConfig.achievements };
    delete newAchievements[achievementId];
    setLocalConfig({
      ...localConfig,
      achievements: newAchievements,
    });
  };

  const handleAddAchievement = (
    name: string,
    description: string,
    category: string
  ) => {
    const newId = `${category}_${Date.now()}`;
    const newAchievement = {
      id: newId,
      name,
      description,
      category: category as AchievementCategory,
      icon: 'Award',
      points: 10,
      tier: 'bronze' as PartnerTier,
      repeatable: false,
    };
    setLocalConfig({
      ...localConfig,
      achievements: {
        ...localConfig.achievements,
        [newId]: newAchievement,
      },
    });
    setNewAchievementForm(false);
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
  const categories = [...new Set(achievements.map((a) => a.category))].sort();

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Configuración de puntos
        </h2>
        {!newAchievementForm && (
          <button
            onClick={() => setNewAchievementForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Agregar Logro
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {newAchievementForm && (
        <NewAchievementForm
          categories={Object.keys(CATEGORY_NAMES)}
          onAdd={handleAddAchievement}
          onCancel={() => setNewAchievementForm(false)}
        />
      )}

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryAchievements = achievements.filter((a) => a.category === category);
          return (
            <div key={category} className="border-t border-[var(--color-border)] pt-6 first:border-t-0 first:pt-0">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                {CATEGORY_NAMES[category] || category}
              </h3>

              <div className="grid gap-4">
                {categoryAchievements.map((achievement) => (
                  <div key={achievement.id}>
                    {editingId === achievement.id ? (
                      <EditAchievementForm
                        achievement={achievement}
                        tiers={TIERS}
                        onChange={(field, value) =>
                          handleAchievementChange(achievement.id, field, value)
                        }
                        onSave={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
                        <div className="flex-1">
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {achievement.name}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {achievement.description}
                          </p>
                          <div className="mt-2 flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-[var(--color-surface)] rounded text-[var(--color-text-secondary)]">
                              {achievement.points} pts
                            </span>
                            <span
                              className={`px-2 py-1 rounded ${
                                achievement.repeatable
                                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                  : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {achievement.repeatable ? 'Repetible' : 'Unica'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => setEditingId(achievement.id)}
                            className="p-2 hover:bg-[var(--color-surface-hover)] rounded transition-colors text-[var(--color-text-secondary)]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {categoryAchievements.length === 0 && (
                <p className="text-sm text-[var(--color-text-secondary)] py-4">
                  No hay logros en esta categoria
                </p>
              )}
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
              <SovraLoader className="h-4 w-4 text-blue-500" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">Configuracion guardada exitosamente</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface EditAchievementFormProps {
  achievement: any;
  tiers: PartnerTier[];
  onChange: (field: string, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditAchievementForm({
  achievement,
  tiers,
  onChange,
  onSave,
  onCancel,
}: EditAchievementFormProps) {
  return (
    <div className="p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-primary)] space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Nombre
        </label>
        <input
          type="text"
          value={achievement.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Descripcion
        </label>
        <textarea
          value={achievement.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Puntos
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={achievement.points}
            onChange={(e) => onChange('points', parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Tier Minimo
          </label>
          <select
            value={achievement.tier}
            onChange={(e) => onChange('tier', e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
          >
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={achievement.repeatable}
          onChange={(e) => onChange('repeatable', e.target.checked)}
          className="rounded"
        />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Repetible
        </span>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

interface NewAchievementFormProps {
  categories: string[];
  onAdd: (name: string, description: string, category: string) => void;
  onCancel: () => void;
}

function NewAchievementForm({
  categories,
  onAdd,
  onCancel,
}: NewAchievementFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'certification');

  return (
    <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del logro..."
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Descripcion
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripcion del logro..."
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Categoria
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_NAMES[cat] || cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            if (name.trim() && description.trim()) {
              onAdd(name, description, category);
            }
          }}
          disabled={!name.trim() || !description.trim()}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar Logro
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
