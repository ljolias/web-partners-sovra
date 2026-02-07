import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
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
import { sendCredentialEmail } from '@/lib/email';
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
    logger.error('Get credentials error:', { error: error });
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
    let sovraIdInvitationId: string | undefined;
    let qrCode: string | undefined;
    let didcommInvitationUrl: string | undefined;

    // Issue credential via SovraID API if configured
    if (isSovraIdConfigured()) {
      try {
        logger.debug('[Credentials API] Issuing credential via SovraID API...');
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

        // Log the FULL API response to understand its structure
        logger.debug('[Credentials API] SovraID credential issued:', { sovraIdCredentialId: sovraIdCredentialId });
        logger.debug('Credentials API FULL API Response', { response: sovraIdResponse });

        // The invitation_wallet contains the data for wallet scanning
        const invitationWallet = sovraIdResponse.invitation_wallet;
        logger.debug('Credentials API invitation_wallet', { invitationWallet });

        // Store the invitation ID for webhook matching
        sovraIdInvitationId = invitationWallet?.invitationId;
        logger.debug('[Credentials API] Invitation ID:', { sovraIdInvitationId: sovraIdInvitationId });

        // Check various possible fields for the DIDComm URL
        // The API might return it in different formats
        let rawInvitationContent = invitationWallet?.invitationContent;

        // If invitationContent is a string that looks like JSON, try to parse it
        if (rawInvitationContent && typeof rawInvitationContent === 'string') {
          // Check if it's already a DIDComm URL
          if (rawInvitationContent.startsWith('didcomm://')) {
            didcommInvitationUrl = rawInvitationContent;
            logger.debug('[Credentials API] invitationContent is already a DIDComm URL');
          }
          // Check if it's a base64-encoded OOB invitation
          else if (rawInvitationContent.match(/^[A-Za-z0-9+/=_-]+$/)) {
            // Looks like base64, construct DIDComm URL
            didcommInvitationUrl = `didcomm://?_oob=${rawInvitationContent}`;
            logger.debug('[Credentials API] Constructed DIDComm URL from base64 invitation');
          }
          // Check if it's a JSON string that needs to be base64 encoded
          else if (rawInvitationContent.startsWith('{')) {
            try {
              // It's JSON, base64 encode it for the DIDComm URL
              const base64Invitation = Buffer.from(rawInvitationContent).toString('base64url');
              didcommInvitationUrl = `didcomm://?_oob=${base64Invitation}`;
              logger.debug('[Credentials API] Constructed DIDComm URL from JSON invitation');
            } catch (e) {
              logger.error('[Credentials API] Failed to encode JSON invitation:', { error: e });
              didcommInvitationUrl = rawInvitationContent;
            }
          }
          // Otherwise use as-is (might be a claim URL)
          else {
            didcommInvitationUrl = rawInvitationContent;
            logger.warn('Credentials API invitationContent format not recognized', { preview: rawInvitationContent.substring(0, 100) });
          }
        }

        // Also check if there's a direct didcommUrl field
        const anyResponse = sovraIdResponse as unknown as Record<string, unknown>;
        if (anyResponse.didcommUrl) {
          didcommInvitationUrl = anyResponse.didcommUrl as string;
          logger.debug('[Credentials API] Found didcommUrl field:', { didcommInvitationUrl: didcommInvitationUrl });
        }

        qrCode = didcommInvitationUrl;
        logger.debug('Credentials API Final QR Code value', { qrCodePreview: qrCode?.substring(0, 100) });
      } catch (sovraError) {
        logger.error('[Credentials API] SovraID API error:', { error: sovraError });

        // If SovraID fails, we can still create the local record with mock data
        // This allows the system to function during API outages
        if (sovraError instanceof SovraIdApiError) {
          logger.warn('[Credentials API] Falling back to mock credential due to SovraID error');
          sovraIdCredentialId = `mock-${credentialId}`;
          qrCode = `https://sovraid.io/claim/${credentialId}`;
        } else {
          throw sovraError;
        }
      }
    } else {
      // SovraID not configured - use mock values
      logger.warn('[Credentials API] SovraID not configured, using mock credential');
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
      sovraIdInvitationId,
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

    // Send email with instructions
    try {
      await sendCredentialEmail({
        to: holderEmail,
        holderName,
        partnerName: partner.companyName,
        role,
        qrCodeData: didcommInvitationUrl,
      });
    } catch (emailErr) {
      logger.error('[Credentials API] Failed to send email:', { error: emailErr });
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      credential,
      didcommInvitationUrl,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Issue credential error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
