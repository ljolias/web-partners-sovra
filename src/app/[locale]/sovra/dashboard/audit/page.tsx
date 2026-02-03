'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Activity,
  Building2,
  ShieldCheck,
  FileText,
  Trophy,
  GraduationCap,
  DollarSign,
  Calendar,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SovraLoader } from '@/components/ui';
import type { AuditLog, AuditAction } from '@/types';

const entityIcons: Record<string, typeof Building2> = {
  partner: Building2,
  credential: ShieldCheck,
  document: FileText,
  deal: Trophy,
  course: GraduationCap,
  pricing: DollarSign,
};

const actionLabels: Record<string, { label: string; color: string }> = {
  'partner.created': { label: 'Partner creado', color: 'text-green-600 bg-green-100' },
  'partner.updated': { label: 'Partner actualizado', color: 'text-blue-600 bg-blue-100' },
  'partner.suspended': { label: 'Partner suspendido', color: 'text-red-600 bg-red-100' },
  'partner.reactivated': { label: 'Partner reactivado', color: 'text-green-600 bg-green-100' },
  'partner.tier_changed': { label: 'Nivel cambiado', color: 'text-purple-600 bg-purple-100' },
  'credential.issued': { label: 'Credencial emitida', color: 'text-green-600 bg-green-100' },
  'credential.revoked': { label: 'Credencial revocada', color: 'text-red-600 bg-red-100' },
  'deal.approved': { label: 'Deal aprobado', color: 'text-green-600 bg-green-100' },
  'deal.rejected': { label: 'Deal rechazado', color: 'text-red-600 bg-red-100' },
  'deal.info_requested': { label: 'Info solicitada', color: 'text-amber-600 bg-amber-100' },
  'document.shared': { label: 'Doc compartido', color: 'text-blue-600 bg-blue-100' },
  'document.verified': { label: 'Doc verificado', color: 'text-green-600 bg-green-100' },
  'pricing.updated': { label: 'Precios actualizados', color: 'text-indigo-600 bg-indigo-100' },
  'course.created': { label: 'Curso creado', color: 'text-green-600 bg-green-100' },
  'course.updated': { label: 'Curso actualizado', color: 'text-blue-600 bg-blue-100' },
  'course.published': { label: 'Curso publicado', color: 'text-green-600 bg-green-100' },
};

const entityTypes = [
  { value: '', label: 'Todas las entidades' },
  { value: 'partner', label: 'Partners' },
  { value: 'credential', label: 'Credenciales' },
  { value: 'deal', label: 'Deals' },
  { value: 'document', label: 'Documentos' },
  { value: 'course', label: 'Cursos' },
  { value: 'pricing', label: 'Precios' },
];

const actions = [
  { value: '', label: 'Todas las acciones' },
  { value: 'partner.created', label: 'Partner creado' },
  { value: 'partner.updated', label: 'Partner actualizado' },
  { value: 'partner.suspended', label: 'Partner suspendido' },
  { value: 'partner.reactivated', label: 'Partner reactivado' },
  { value: 'credential.issued', label: 'Credencial emitida' },
  { value: 'credential.revoked', label: 'Credencial revocada' },
  { value: 'deal.approved', label: 'Deal aprobado' },
  { value: 'deal.rejected', label: 'Deal rechazado' },
  { value: 'course.created', label: 'Curso creado' },
  { value: 'course.published', label: 'Curso publicado' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

function groupLogsByDate(logs: AuditLog[]): Map<string, AuditLog[]> {
  const groups = new Map<string, AuditLog[]>();

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    let key: string;
    if (diffDays === 0) {
      key = 'Hoy';
    } else if (diffDays === 1) {
      key = 'Ayer';
    } else if (diffDays < 7) {
      key = 'Esta semana';
    } else if (diffDays < 30) {
      key = 'Este mes';
    } else {
      key = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(log);
  });

  return groups;
}

export default function AuditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState(searchParams.get('entity') || '');
  const [filterAction, setFilterAction] = useState(searchParams.get('action') || '');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());
      if (filterEntity) params.set('entityType', filterEntity);
      if (filterAction) params.set('action', filterAction);
      if (filterDateFrom) params.set('from', filterDateFrom);
      if (filterDateTo) params.set('to', filterDateTo);

      const response = await fetch(`/api/sovra/audit?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.logs || []);
      setHasMore((data.logs || []).length === limit);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filterEntity, filterAction, filterDateFrom, filterDateTo, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEntity) params.set('entityType', filterEntity);
      if (filterAction) params.set('action', filterAction);
      if (filterDateFrom) params.set('from', filterDateFrom);
      if (filterDateTo) params.set('to', filterDateTo);

      const response = await fetch(`/api/sovra/audit/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Audit Log
          </h1>
          <p className="text-[var(--color-text-secondary)]">Historial de todas las acciones en el sistema</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filterEntity}
              onChange={(e) => { setFilterEntity(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            >
              {entityTypes.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>

            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            >
              {actions.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => { setFilterDateFrom(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                placeholder="Desde"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => { setFilterDateTo(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                placeholder="Hasta"
              />
            </div>
          </div>

          {(filterEntity || filterAction || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setFilterEntity('');
                setFilterAction('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setPage(0);
              }}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <SovraLoader size="md" className="text-[var(--color-primary)] mx-auto" />
          <p className="text-[var(--color-text-secondary)] mt-4">Cargando logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <Activity className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">No hay logs que mostrar</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          {Array.from(groupedLogs.entries()).map(([dateGroup, groupLogs]) => (
            <div key={dateGroup}>
              <div className="px-6 py-3 bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">{dateGroup}</h3>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {groupLogs.map((log) => {
                  const Icon = entityIcons[log.entityType] || Activity;
                  const actionConfig = actionLabels[log.action] || {
                    label: log.action,
                    color: 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]',
                  };

                  return (
                    <div key={log.id} className="px-6 py-4 hover:bg-[var(--color-surface-hover)] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-[var(--color-text-primary)]">{log.actorName}</span>
                            <span className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              actionConfig.color
                            )}>
                              {actionConfig.label}
                            </span>
                            {log.entityName && (
                              <span className="text-[var(--color-text-secondary)]">{log.entityName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-[var(--color-text-secondary)]">
                            <span>{formatDate(log.timestamp)}</span>
                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                            <span className="capitalize">{log.entityType}</span>
                            <span className="text-[var(--color-text-muted)]">ID: {log.entityId.slice(0, 8)}...</span>
                          </div>
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-[var(--color-primary)] cursor-pointer hover:underline">
                                Ver cambios
                              </summary>
                              <div className="mt-2 p-2 bg-[var(--color-surface-hover)] rounded text-xs font-mono">
                                {Object.entries(log.changes).map(([key, change]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="text-[var(--color-text-secondary)]">{key}:</span>
                                    <span className="text-red-600 line-through">{String(change.old)}</span>
                                    <span className="text-green-600">{String(change.new)}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="px-6 py-4 bg-[var(--color-surface-hover)] border-t border-[var(--color-border)] flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Mostrando {page * limit + 1} - {page * limit + logs.length} registros
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[var(--color-text-secondary)]">Pagina {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
