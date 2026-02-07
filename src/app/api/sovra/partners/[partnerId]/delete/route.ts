import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import {
  getPartner,
  deletePartner,
  addAuditLog,
} from '@/lib/redis/operations';

interface RouteContext {
  params: Promise<{ partnerId: string }>;
}

// DELETE - Permanently delete a partner and all associated data
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can delete partners
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { partnerId } = await context.params;

    // Get partner to verify it exists and is suspended
    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Partner must be suspended before deletion
    if (partner.status !== 'suspended') {
      return NextResponse.json(
        { error: 'Partner must be suspended before deletion' },
        { status: 400 }
      );
    }

    // Delete the partner and all associated data
    await deletePartner(partnerId);

    // Log the deletion
    await addAuditLog(
      'partner.deleted',
      'partner',
      partnerId,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      {
        entityName: partner.companyName,
        metadata: {
          reason: 'Permanent deletion requested by admin',
          deletedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Partner and all associated data deleted permanently',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Delete partner error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
