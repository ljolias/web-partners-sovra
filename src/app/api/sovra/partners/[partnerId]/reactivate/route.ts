import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getPartner,
  reactivatePartner,
  addAuditLog,
} from '@/lib/redis';

interface RouteParams {
  params: Promise<{ partnerId: string }>;
}

// POST - Reactivate partner
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { partnerId } = await params;

    // Only Sovra Admin can reactivate partners
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 });
    }

    if (partner.status === 'active') {
      return NextResponse.json({ error: 'Partner ya esta activo' }, { status: 400 });
    }

    // Reactivate partner
    await reactivatePartner(partnerId);

    // Add audit log
    await addAuditLog(
      'partner.reactivated',
      'partner',
      partnerId,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      {
        entityName: partner.companyName,
        metadata: {
          previousSuspensionReason: partner.suspendedReason,
          suspendedAt: partner.suspendedAt,
        },
      }
    );

    const updatedPartner = await getPartner(partnerId);

    return NextResponse.json({
      partner: updatedPartner,
      message: 'Partner reactivado exitosamente.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Reactivate partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
