import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getPartner,
  getPartnerCredentials,
  createPartnerCredential,
  getCredentialByEmail,
  generateId,
  addAuditLog,
} from '@/lib/redis';
import type { PartnerCredential, CredentialRole } from '@/types';

interface RouteParams {
  params: Promise<{ partnerId: string }>;
}

// GET - List partner credentials
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { partnerId } = await params;

    // Only Sovra Admin can access this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const credentials = await getPartnerCredentials(partnerId);

    return NextResponse.json({ credentials });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Issue new credential
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { partnerId } = await params;

    // Only Sovra Admin can issue credentials
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const partner = await getPartner(partnerId);
    if (!partner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 });
    }

    if (partner.status === 'suspended') {
      return NextResponse.json(
        { error: 'No se pueden emitir credenciales para partners suspendidos' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { holderName, holderEmail, role } = body;

    // Validation
    if (!holderName || !holderEmail || !role) {
      return NextResponse.json(
        { error: 'Campos requeridos: holderName, holderEmail, role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: CredentialRole[] = ['admin', 'sales', 'legal', 'admin_secondary'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol invalido' }, { status: 400 });
    }

    // Check if credential already exists for this email
    const existingCredential = await getCredentialByEmail(holderEmail);
    if (existingCredential && existingCredential.status !== 'revoked') {
      return NextResponse.json(
        { error: 'Ya existe una credencial activa para este email' },
        { status: 400 }
      );
    }

    // Create credential
    const now = new Date().toISOString();
    const credential: PartnerCredential = {
      id: generateId(),
      partnerId,
      holderName,
      holderEmail: holderEmail.toLowerCase(),
      role,
      status: 'issued',
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
      // Mock SovraID integration - in production this would call the SovraID API
      sovraIdCredentialId: `sovraid-${generateId()}`,
      qrCode: `https://sovraid.io/claim/${generateId()}`, // Mock QR URL
    };

    await createPartnerCredential(credential);

    // Add audit log
    await addAuditLog(
      'credential.issued',
      'credential',
      credential.id,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      {
        entityName: `${holderName} (${partner.companyName})`,
        metadata: {
          partnerId,
          partnerName: partner.companyName,
          holderEmail,
          role,
        },
      }
    );

    // TODO: Send email with QR code and instructions
    // await sendCredentialEmail(holderEmail, holderName, partner.companyName, credential.qrCode);

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Issue credential error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
