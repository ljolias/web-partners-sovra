'use client';

import type { DealStatusChange, DealStatus } from '@/types';

const STATUS_COLORS: Record<DealStatus, string> = {
  pending_approval: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  more_info: 'bg-orange-500',
  negotiation: 'bg-blue-500',
  contracting: 'bg-indigo-500',
  awarded: 'bg-purple-500',
  won: 'bg-green-600',
  lost: 'bg-gray-500',
};

const STATUS_LABELS: Record<DealStatus, string> = {
  pending_approval: 'Pendiente de Aprobación',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  more_info: 'Más Información Requerida',
  negotiation: 'En Negociación',
  contracting: 'En Contratación',
  awarded: 'Adjudicada',
  won: 'Ganada',
  lost: 'Perdida',
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function StatusTimeline({ history }: { history: DealStatusChange[] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No hay cambios de estado registrados
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((change, idx) => (
        <div key={change.id} className="relative pl-8">
          <div
            className={`absolute left-0 top-1 w-3 h-3 rounded-full ${STATUS_COLORS[change.toStatus]}`}
          />
          {idx !== history.length - 1 && (
            <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-gray-200" />
          )}

          <div className="pb-6">
            <p className="text-xs text-gray-500 mb-1">
              {formatDate(change.changedAt)}
            </p>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {STATUS_LABELS[change.toStatus]}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              Por: <span className="font-medium">{change.changedByName}</span>
            </p>
            {change.notes && (
              <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                "{change.notes}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
