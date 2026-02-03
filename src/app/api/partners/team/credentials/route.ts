import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
  getPartner,
  createPartnerCredential,
  getCredentialByEmail,
  generateId,
  addAuditLog,
} from '@/lib/redis';
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, partner } = session;

    // Only Partner Admin can issue credentials to their team
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo el Admin del partner puede agregar miembros al equipo' },
        { status: 403 }
      );
    }

    // Get partner details
    const partnerData = await getPartner(partner.id);
    if (!partnerData) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 });
    }

    if (partnerData.status === 'suspended') {
      return NextResponse.json(
        { error: 'No se pueden emitir credenciales mientras el partner esta suspendido' },
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

    // Partner Admins can only issue 'sales' and 'legal' roles
    // 'admin' and 'admin_secondary' require Sovra Admin
    const allowedRoles: CredentialRole[] = ['sales', 'legal'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Solo puedes asignar roles de Sales o Legal. Para Admin, contacta a Sovra.' },
        { status: 400 }
      );
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
        console.log('[Partner Team API] Issuing credential via SovraID API...');
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
        console.log('[Partner Team API] SovraID credential issued:', sovraIdCredentialId);
        console.log('[Partner Team API] FULL API Response:', JSON.stringify(sovraIdResponse, null, 2));

        // Store the invitation ID for webhook matching (CRITICAL!)
        const invitationWallet = sovraIdResponse.invitation_wallet;
        sovraIdInvitationId = invitationWallet?.invitationId;
        console.log('[Partner Team API] Invitation ID:', sovraIdInvitationId);

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
        console.log('[Partner Team API] Final QR Code value:', qrCode?.substring(0, 100));
      } catch (sovraError) {
        console.error('[Partner Team API] SovraID API error:', sovraError);

        if (sovraError instanceof SovraIdApiError) {
          console.warn('[Partner Team API] Falling back to mock credential');
          sovraIdCredentialId = `mock-${credentialId}`;
          qrCode = `https://sovraid.io/claim/${credentialId}`;
        } else {
          throw sovraError;
        }
      }
    } else {
      console.warn('[Partner Team API] SovraID not configured, using mock credential');
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
      role,
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

    return NextResponse.json({
      credential,
      didcommInvitationUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('[Partner Team API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
