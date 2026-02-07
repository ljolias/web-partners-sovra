import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import {
  getPartner,
  suspendPartner,
  revokeAllPartnerCredentials,
  addAuditLog,
} from '@/lib/redis';

interface RouteParams {
  params: Promise<{ partnerId: string }>;
}

// POST - Suspend partner
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { partnerId } = await params;

    // Only Sovra Admin can suspend partners
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 });
    }

    if (partner.status === 'suspended') {
      return NextResponse.json({ error: 'Partner ya esta suspendido' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Razon de suspension requerida' }, { status: 400 });
    }

    // Suspend partner
    await suspendPartner(partnerId, user.id, reason.trim());

    // Revoke all credentials
    await revokeAllPartnerCredentials(
      partnerId,
      user.id,
      `Partner suspendido: ${reason.trim()}`
    );

    // Add audit log
    await addAuditLog(
      'partner.suspended',
      'partner',
      partnerId,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      {
        entityName: partner.companyName,
        metadata: { reason: reason.trim() },
      }
    );

    const updatedPartner = await getPartner(partnerId);

    return NextResponse.json({
      partner: updatedPartner,
      message: 'Partner suspendido exitosamente. Todas las credenciales han sido revocadas.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Suspend partner error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
