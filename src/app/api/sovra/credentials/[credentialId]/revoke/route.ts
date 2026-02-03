import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  getPartnerCredential,
  getPartner,
  revokePartnerCredential,
  addAuditLog,
} from '@/lib/redis';
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';

interface RouteParams {
  params: Promise<{ credentialId: string }>;
}

// POST - Revoke credential
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { credentialId } = await params;

    // Only Sovra Admin can revoke credentials
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const credential = await getPartnerCredential(credentialId);
    if (!credential) {
      return NextResponse.json({ error: 'Credencial no encontrada' }, { status: 404 });
    }

    if (credential.status === 'revoked') {
      return NextResponse.json({ error: 'Credencial ya esta revocada' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Razon de revocacion requerida' }, { status: 400 });
    }

    // Revoke in SovraID if configured and has real credential ID
    if (isSovraIdConfigured() && credential.sovraIdCredentialId && !credential.sovraIdCredentialId.startsWith('mock-')) {
      try {
        console.log('[Credentials API] Revoking credential in SovraID:', credential.sovraIdCredentialId);
        const sovraIdClient = getSovraIdClient();
        await sovraIdClient.revokeCredential(credential.sovraIdCredentialId, reason.trim());
        console.log('[Credentials API] SovraID credential revoked successfully');
      } catch (sovraError) {
        console.error('[Credentials API] SovraID revoke error:', sovraError);

        // Log the error but continue with local revocation
        // This ensures the local state is updated even if SovraID is unavailable
        if (!(sovraError instanceof SovraIdApiError)) {
          throw sovraError;
        }
        console.warn('[Credentials API] Continuing with local revocation despite SovraID error');
      }
    }

    // Revoke credential locally
    await revokePartnerCredential(credentialId, user.id, reason.trim());

    // Get partner for audit log
    const partner = await getPartner(credential.partnerId);

    // Add audit log
    await addAuditLog(
      'credential.revoked',
      'credential',
      credentialId,
      { id: user.id, name: user.name, type: 'sovra_admin' },
      {
        entityName: `${credential.holderName} (${partner?.companyName || 'Unknown'})`,
        metadata: {
          partnerId: credential.partnerId,
          holderEmail: credential.holderEmail,
          reason: reason.trim(),
          sovraIdCredentialId: credential.sovraIdCredentialId,
          usedRealApi: isSovraIdConfigured() && !credential.sovraIdCredentialId?.startsWith('mock-'),
        },
      }
    );

    const updatedCredential = await getPartnerCredential(credentialId);

    return NextResponse.json({
      credential: updatedCredential,
      message: 'Credencial revocada exitosamente.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Revoke credential error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
