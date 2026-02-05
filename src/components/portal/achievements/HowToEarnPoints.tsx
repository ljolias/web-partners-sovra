'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import {
  Briefcase,
  BookOpen,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react';

export function HowToEarnPoints() {
  const t = useTranslations();

  const pointsWays = [
    {
      icon: Briefcase,
      title: 'Oportunidades Comerciales',
      points: '+30 pts',
      desc: 'Primera oportunidad registrada',
      details: [
        '1ª oportunidad: +30 pts',
        '5 oportunidades: +50 pts adicionales',
      ],
      color: 'bg-blue-500/10 border-blue-500/30',
      iconColor: 'text-blue-500',
    },
    {
      icon: Trophy,
      title: 'Deals Ganados',
      points: '+100 pts',
      desc: 'Cerrar deals exitosamente',
      details: [
        '1er deal ganado: +100 pts',
        '2 deals ganados: +100 pts adicionales',
      ],
      color: 'bg-emerald-500/10 border-emerald-500/30',
      iconColor: 'text-emerald-500',
    },
    {
      icon: BookOpen,
      title: 'Capacitaciones',
      points: '+20 pts',
      desc: 'Completar módulos de entrenamiento',
      details: [
        'Cada módulo completado: +20 pts',
        'Certificación completa: desbloquea tiers',
      ],
      color: 'bg-amber-500/10 border-amber-500/30',
      iconColor: 'text-amber-500',
    },
    {
      icon: TrendingUp,
      title: 'Calificación de Partner',
      points: 'Variable',
      desc: 'Rating mejora con actividad',
      details: [
        'Deals de calidad: +rating',
        'Engagement (copilot, training): +rating',
        'Rating 50+: Silver tier, 70+: Gold, 90+: Platinum',
      ],
      color: 'bg-purple-500/10 border-purple-500/30',
      iconColor: 'text-purple-500',
    },
  ];

  const tierProgression = [
    {
      tier: 'Bronze',
      icon: '🟤',
      discount: '5%',
      requirements: 'Inicio',
      desc: 'Nivel inicial',
    },
    {
      tier: 'Silver',
      icon: '⚪',
      discount: '20%',
      requirements: 'Rating 50+ + 1 certificación',
      desc: 'Soporte prioritario',
    },
    {
      tier: 'Gold',
      icon: '🟡',
      discount: '25%',
      requirements: '2 certs + 1 deal + 2 ops',
      desc: 'Co-marketing incluido',
    },
    {
      tier: 'Platinum',
      icon: '🔷',
      discount: '30%',
      requirements: '3 certs + 5 ops + 2 deals',
      desc: 'Account Manager dedicado',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold font-display text-[var(--color-text-primary)] flex items-center gap-3 mb-2">
          <Zap className="h-6 w-6 text-amber-400" />
          Cómo Ganar Puntos y Subir de Nivel
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Cada acción que realizas suma puntos. Acumula puntos para desbloquear beneficios y
          subir de tier.
        </p>
      </div>

      {/* Ways to Earn Points */}
      <div>
        <h4 className="text-lg font-bold font-display text-[var(--color-text-primary)] mb-4">
          Formas de Ganar Puntos
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {pointsWays.map((way) => {
            const Icon = way.icon;
            return (
              <Card
                key={way.title}
                className={`p-5 bg-[var(--color-surface)] border ${way.color} card-hover-gradient`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 bg-[var(--color-surface-hover)]`}>
                    <Icon className={`h-6 w-6 ${way.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-bold text-[var(--color-text-primary)]">
                        {way.title}
                      </h5>
                      <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        {way.points}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                      {way.desc}
                    </p>
                    <ul className="space-y-1">
                      {way.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2"
                        >
                          <span className="h-1 w-1 rounded-full bg-[var(--color-primary)]" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tier Progression */}
      <div>
        <h4 className="text-lg font-bold font-display text-[var(--color-text-primary)] mb-4">
          Progresión de Tiers
        </h4>
        <div className="grid md:grid-cols-4 gap-3">
          {tierProgression.map((tier) => (
            <Card
              key={tier.tier}
              className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] card-hover-gradient"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h5 className="font-bold text-[var(--color-text-primary)] mb-2">
                  {tier.tier}
                </h5>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                      Descuento
                    </p>
                    <p className="font-bold text-emerald-400">{tier.discount}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                      Beneficio
                    </p>
                    <p className="text-xs text-[var(--color-text-primary)]">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                      Requisitos
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {tier.requirements}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="p-6 bg-[var(--color-surface-hover)] border border-[var(--color-border)] card-hover-gradient">
        <h4 className="font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span> Consejos Rápidos
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] text-sm mb-2">
              1. Registra Oportunidades
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Cada oportunidad registrada suma puntos. La 1ª y 5ª oportunidad desbloquean
              logros especiales.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] text-sm mb-2">
              2. Completa Capacitaciones
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Usa el Centro de Entrenamiento. Cada módulo suma +20 pts y mejora tu rating.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] text-sm mb-2">
              3. Gana Deals
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Cerrar deals exitosamente es la mayor fuente de puntos (+100) y mejora rating.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Note */}
      <div className="p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg">
        <p className="text-sm text-[var(--color-text-primary)]">
          <span className="font-bold">📊 Nota:</span> Tu progreso se actualiza en tiempo real.
          Cada acción que realices (registrar oportunidad, completar capacitación, ganar deal)
          se refleja instantáneamente en tu dashboard.
        </p>
      </div>
    </div>
  );
}
