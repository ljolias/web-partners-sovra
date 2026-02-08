import Link from 'next/link';
import { GraduationCap, Award, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import type { Certification } from '@/types';

interface TrainingSummaryCardProps {
  locale: string;
  certifications: Certification[];
  completedModules?: number;
  totalModules?: number;
  inProgressCourses?: number;
}

export function TrainingSummaryCard({
  locale,
  certifications,
  completedModules = 0,
  totalModules = 0,
  inProgressCourses = 0,
}: TrainingSummaryCardProps) {
  const progressPercentage = totalModules > 0
    ? Math.round((completedModules / totalModules) * 100)
    : 0;

  const activeCerts = certifications.filter(c => c.status === 'active');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            Capacitación
          </CardTitle>
          <Link href={`/${locale}/partners/portal/training-center`}>
            <Button variant="ghost" size="sm">
              Ver todo
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {/* Training Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                Progreso de Capacitación
              </span>
            </div>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {completedModules}/{totalModules} módulos
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-hover)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Active Certifications */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-2">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
              {activeCerts.length}
            </p>
            <p className="text-center text-xs text-[var(--color-text-secondary)] mt-1 break-words">
              Certs
            </p>
          </div>

          {/* In Progress Courses */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-2">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
              {inProgressCourses}
            </p>
            <p className="text-center text-xs text-[var(--color-text-secondary)] mt-1 break-words">
              En progreso
            </p>
          </div>

          {/* Completion Rate */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-2">
            <div className="flex items-center justify-center mb-1">
              <GraduationCap className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
              {progressPercentage}%
            </p>
            <p className="text-center text-xs text-[var(--color-text-secondary)] mt-1 break-words">
              Completado
            </p>
          </div>
        </div>

        {/* Active Certifications List */}
        {activeCerts.length > 0 && (
          <div className="pt-3 border-t border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Certificaciones Activas:
            </p>
            <div className="flex flex-wrap gap-2">
              {activeCerts.slice(0, 3).map((cert) => (
                <Badge key={cert.id} variant="success" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {cert.type === 'sales_fundamentals' && 'Fundamentos'}
                  {cert.type === 'technical_specialist' && 'Técnico'}
                  {cert.type === 'solution_architect' && 'Arquitecto'}
                </Badge>
              ))}
              {activeCerts.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{activeCerts.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {progressPercentage < 100 && (
          <div className="pt-3 border-t border-[var(--color-border)]">
            <Link href={`/${locale}/partners/portal/training-center`}>
              <Button variant="outline" className="w-full" size="sm">
                <GraduationCap className="h-4 w-4 mr-2" />
                Continuar Capacitación
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
