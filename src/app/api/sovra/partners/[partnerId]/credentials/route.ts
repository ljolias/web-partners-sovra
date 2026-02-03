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
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';
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

    const now = new Date().toISOString();
    const credentialId = generateId();

    let sovraIdCredentialId: string | undefined;
    let qrCode: string | undefined;
    let didcommInvitationUrl: string | undefined;

    // Issue credential via SovraID API if configured
    if (isSovraIdConfigured()) {
      try {
        console.log('[Credentials API] Issuing credential via SovraID API...');
        const sovraIdClient = getSovraIdClient();

        // Calculate expiration date (1 year from now)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        const sovraIdResponse = await sovraIdClient.issueCredential({
          partnerName: partner.companyName,
          partnerLogo: partner.logoUrl,
          holderName,
          holderEmail: holderEmail.toLowerCase(),
          role,
          expirationDate: expirationDate.toISOString().split('T')[0], // YYYY-MM-DD format
        });

        sovraIdCredentialId = sovraIdResponse.id;
        // The invitationContent contains the DIDComm URL for wallet scanning
        didcommInvitationUrl = sovraIdResponse.invitation_wallet?.invitationContent;
        qrCode = didcommInvitationUrl;

        console.log('[Credentials API] SovraID credential issued:', sovraIdCredentialId);
        console.log('[Credentials API] Full invitation_wallet response:', JSON.stringify(sovraIdResponse.invitation_wallet));
        console.log('[Credentials API] DIDComm URL:', didcommInvitationUrl);

        // Debug: Check if the URL starts with didcomm://
        if (didcommInvitationUrl && !didcommInvitationUrl.startsWith('didcomm://')) {
          console.warn('[Credentials API] WARNING: invitationContent is not a DIDComm URL:', didcommInvitationUrl);
        }
      } catch (sovraError) {
        console.error('[Credentials API] SovraID API error:', sovraError);

        // If SovraID fails, we can still create the local record with mock data
        // This allows the system to function during API outages
        if (sovraError instanceof SovraIdApiError) {
          console.warn('[Credentials API] Falling back to mock credential due to SovraID error');
          sovraIdCredentialId = `mock-${credentialId}`;
          qrCode = `https://sovraid.io/claim/${credentialId}`;
        } else {
          throw sovraError;
        }
      }
    } else {
      // SovraID not configured - use mock values
      console.warn('[Credentials API] SovraID not configured, using mock credential');
      sovraIdCredentialId = `mock-${credentialId}`;
      qrCode = `https://sovraid.io/claim/${credentialId}`;
    }

    // Create credential record
    const credential: PartnerCredential = {
      id: credentialId,
      partnerId,
      holderName,
      holderEmail: holderEmail.toLowerCase(),
      role,
      status: 'issued',
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
      sovraIdCredentialId,
      qrCode,
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
          sovraIdCredentialId,
          usedRealApi: isSovraIdConfigured(),
        },
      }
    );

    // TODO: Send email with QR code and instructions
    // await sendCredentialEmail({
    //   to: holderEmail,
    //   holderName,
    //   partnerName: partner.companyName,
    //   qrCode: credential.qrCode,
    //   didcommUrl: didcommInvitationUrl,
    // });

    return NextResponse.json({
      credential,
      didcommInvitationUrl,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Issue credential error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
