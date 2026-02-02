import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getAllAuditLogs,
  getAuditLogsByAction,
} from '@/lib/redis';
import type { AuditAction } from '@/types';

// GET - List audit logs with filters
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can access audit logs
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action') as AuditAction | null;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Fetch logs
    let logs = await getAllAuditLogs(Math.min(limit + offset + 100, 500), 0);

    // Filter by entity type
    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }

    // Filter by action
    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    // Filter by date range
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

    // Apply pagination
    const paginatedLogs = logs.slice(offset, offset + limit);

    return NextResponse.json({
      logs: paginatedLogs,
      total: logs.length,
      hasMore: offset + limit < logs.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get audit logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
