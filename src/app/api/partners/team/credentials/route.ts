import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ValidationError, NotFoundError, ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { getCurrentSession } from '@/lib/auth';
import {
  getPartner,
  createPartnerCredential,
  getCredentialByEmail,
  generateId,
  addAuditLog,
} from '@/lib/redis';
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';
import { sendCredentialEmail } from '@/lib/email';
import { credentialIssuanceSchema, validateInput } from '@/lib/validation/schemas';
import type { PartnerCredential, CredentialRole } from '@/types';

/**
 * POST /api/partners/team/credentials
 *
 * Allows Partner Admin to issue credentials to their team members.
 * Restricted roles: only 'sales' and 'legal' can be issued by partner admins.
 * 'admin' and 'admin_secondary' can only be issued by Sovra Admin.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      throw new UnauthorizedError();
    }

    const { user, partner } = session;

    // Only Partner Admin can issue credentials to their team
    if (user.role !== 'admin') {
      throw new ForbiddenError('Solo el Admin del partner puede agregar miembros al equipo');
    }

    // Get partner details
    const partnerData = await getPartner(partner.id);
    if (!partnerData) {
      throw new NotFoundError('Partner');
    }

    if (partnerData.status === 'suspended') {
      throw new ValidationError('No se pueden emitir credenciales mientras el partner esta suspendido');
    }

    // Validate input
    const body = await request.json();
    const validation = await validateInput(credentialIssuanceSchema, {
      ...body,
      partnerId: partner.id,
    });

    if (!validation.success) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    const { holderName, holderEmail, role } = validation.data;

    // Partner Admins can only issue 'partner_user' and 'partner_admin' roles
    const allowedRoles: CredentialRole[] = ['sales', 'legal'];
    if (!allowedRoles.includes(role as CredentialRole)) {
      throw new ValidationError('Solo puedes asignar roles de Sales o Legal. Para Admin, contacta a Sovra.');
    }

    // Check if credential already exists for this email
    const existingCredential = await getCredentialByEmail(holderEmail);
    if (existingCredential && existingCredential.status !== 'revoked') {
      throw new ValidationError('Ya existe una credencial activa para este email');
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
        logger.debug('[Partner Team API] Issuing credential via SovraID API...');
        const sovraIdClient = getSovraIdClient();

        // Calculate expiration date (1 year from now)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        const sovraIdResponse = await sovraIdClient.issueCredential({
          partnerName: partnerData.companyName,
          partnerLogo: partnerData.logoUrl,
          holderName,
          holderEmail: holderEmail.toLowerCase(),
          role,
          expirationDate: expirationDate.toISOString().split('T')[0],
        });

        sovraIdCredentialId = sovraIdResponse.id;

        // Log the full response for debugging
        logger.debug('[Partner Team API] SovraID credential issued:', { sovraIdCredentialId: sovraIdCredentialId });
        logger.debug('[Partner Team API] FULL API Response:', { data: sovraIdResponse });

        // Store the invitation ID for webhook matching (CRITICAL!)
        const invitationWallet = sovraIdResponse.invitation_wallet;
        sovraIdInvitationId = invitationWallet?.invitationId;
        logger.debug('[Partner Team API] Invitation ID:', { sovraIdInvitationId: sovraIdInvitationId });

        // Process the invitationContent to get the DIDComm URL
        let rawInvitationContent = invitationWallet?.invitationContent;

        if (rawInvitationContent && typeof rawInvitationContent === 'string') {
          if (rawInvitationContent.startsWith('didcomm://')) {
            didcommInvitationUrl = rawInvitationContent;
          } else if (rawInvitationContent.match(/^[A-Za-z0-9+/=_-]+$/)) {
            didcommInvitationUrl = `didcomm://?_oob=${rawInvitationContent}`;
          } else if (rawInvitationContent.startsWith('{')) {
            const base64Invitation = Buffer.from(rawInvitationContent).toString('base64url');
            didcommInvitationUrl = `didcomm://?_oob=${base64Invitation}`;
          } else {
            didcommInvitationUrl = rawInvitationContent;
          }
        }

        qrCode = didcommInvitationUrl;
        logger.debug('Final QR Code value', { qrCodePreview: qrCode?.substring(0, 100) });
      } catch (sovraError) {
        logger.error('[Partner Team API] SovraID API error:', { error: sovraError });

        if (sovraError instanceof SovraIdApiError) {
          logger.warn('[Partner Team API] Falling back to mock credential');
          sovraIdCredentialId = `mock-${credentialId}`;
          qrCode = `https://sovraid.io/claim/${credentialId}`;
        } else {
          throw sovraError;
        }
      }
    } else {
      logger.warn('[Partner Team API] SovraID not configured, using mock credential');
      sovraIdCredentialId = `mock-${credentialId}`;
      qrCode = `https://sovraid.io/claim/${credentialId}`;
    }

    // Create credential record
    const credential: PartnerCredential = {
      id: credentialId,
      partnerId: partner.id,
      userId: undefined, // Will be linked when user claims credential
      holderName,
      holderEmail: holderEmail.toLowerCase(),
      role: role as CredentialRole, // Safe cast since we validated it's 'sales' or 'legal'
      status: 'issued',
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
      sovraIdCredentialId,
      sovraIdInvitationId, // Required for webhook matching when credential is claimed
      qrCode,
    };

    await createPartnerCredential(credential);

    // Add audit log - visible to Sovra Admin
    await addAuditLog(
      'credential.issued',
      'credential',
      credential.id,
      { id: user.id, name: user.name, type: 'partner' as never },
      {
        entityName: `${holderName} (${partnerData.companyName})`,
        metadata: {
          partnerId: partner.id,
          partnerName: partnerData.companyName,
          holderEmail,
          role,
          sovraIdCredentialId,
          issuedByPartnerAdmin: true,
          issuedBy: user.name,
        },
      }
    );

    // Send email with instructions
    try {
      await sendCredentialEmail({
        to: holderEmail,
        holderName,
        partnerName: partnerData.companyName,
        role,
        qrCodeData: didcommInvitationUrl,
      });
    } catch (emailErr) {
      logger.error('[Partner Team API] Failed to send email:', { error: emailErr });
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      credential,
      didcommInvitationUrl,
    }, { status: 201 });
  } catch (error) {
    logger.error('[Partner Team API] Error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
