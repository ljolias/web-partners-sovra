import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getAllAuditLogs } from '@/lib/redis';
import type { AuditAction } from '@/types';

// GET - Export audit logs as CSV
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can export audit logs
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action') as AuditAction | null;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Fetch all logs (up to a reasonable limit for export)
    let logs = await getAllAuditLogs(1000, 0);

    // Apply filters
    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }

    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      logs = logs.filter(log => new Date(log.timestamp) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      logs = logs.filter(log => new Date(log.timestamp) <= to);
    }

    // Build CSV content
    const headers = [
      'ID',
      'Timestamp',
      'Actor',
      'Actor Type',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Name',
      'IP Address',
      'Changes',
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.actorName,
      log.actorType,
      log.action,
      log.entityType,
      log.entityId,
      log.entityName || '',
      log.ipAddress || '',
      log.changes ? JSON.stringify(log.changes) : '',
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(cell => escapeCSV(String(cell))).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Export audit logs error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
