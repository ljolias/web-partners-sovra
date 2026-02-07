import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getPartnerCredential, updatePartnerCredential } from '@/lib/redis';
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';

interface RouteParams {
  params: Promise<{ credentialId: string }>;
}

/**
 * GET /api/sovra/credentials/[credentialId]/status
 *
 * Checks the real-time status of a credential in SovraID
 * and syncs it with the local database
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { credentialId } = await params;

    // Only Sovra Admin can check credential status
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const credential = await getPartnerCredential(credentialId);
    if (!credential) {
      return NextResponse.json({ error: 'Credencial no encontrada' }, { status: 404 });
    }

    // If no real SovraID credential ID, return local status only
    if (!credential.sovraIdCredentialId || credential.sovraIdCredentialId.startsWith('mock-')) {
      return NextResponse.json({
        credentialId: credential.id,
        localStatus: credential.status,
        sovraIdStatus: null,
        synced: true,
        message: 'Esta credencial usa datos mock (SovraID no configurado)',
        isMock: true,
      });
    }

    // Check if SovraID is configured
    if (!isSovraIdConfigured()) {
      return NextResponse.json({
        credentialId: credential.id,
        localStatus: credential.status,
        sovraIdStatus: null,
        synced: false,
        message: 'SovraID no esta configurado',
        isMock: false,
      });
    }

    // Get real-time status from SovraID
    try {
      const client = getSovraIdClient();
      const sovraStatus = await client.getCredentialStatus(credential.sovraIdCredentialId);

      // Map SovraID status to local status
      let mappedStatus = credential.status;
      let statusChanged = false;

      if (sovraStatus.status === 'active' && sovraStatus.claimedAt) {
        // Credential was claimed
        if (credential.status !== 'active') {
          mappedStatus = 'active';
          statusChanged = true;
          await updatePartnerCredential(credentialId, {
            status: 'active',
            claimedAt: sovraStatus.claimedAt,
          });
        }
      } else if (sovraStatus.status === 'revoked') {
        // Credential was revoked
        if (credential.status !== 'revoked') {
          mappedStatus = 'revoked';
          statusChanged = true;
          await updatePartnerCredential(credentialId, {
            status: 'revoked',
            revokedAt: sovraStatus.statusChangedAt || new Date().toISOString(),
            revokedReason: sovraStatus.reason || 'Revoked in SovraID',
          });
        }
      } else if (sovraStatus.status === 'suspended') {
        // Credential was suspended - map to revoked for simplicity
        if (credential.status !== 'revoked') {
          mappedStatus = 'revoked';
          statusChanged = true;
          await updatePartnerCredential(credentialId, {
            status: 'revoked',
            revokedAt: sovraStatus.statusChangedAt || new Date().toISOString(),
            revokedReason: sovraStatus.reason || 'Suspended in SovraID',
          });
        }
      }

      return NextResponse.json({
        credentialId: credential.id,
        localStatus: statusChanged ? mappedStatus : credential.status,
        sovraIdStatus: sovraStatus.status,
        sovraIdCredentialId: credential.sovraIdCredentialId,
        holderDid: sovraStatus.holderDid,
        claimedAt: sovraStatus.claimedAt,
        synced: credential.status === mappedStatus,
        statusChanged,
        message: statusChanged
          ? `Estado actualizado de '${credential.status}' a '${mappedStatus}'`
          : 'Estados sincronizados',
        isMock: false,
      });
    } catch (apiError) {
      logger.error('[Credential Status] SovraID API error:', { error: apiError });

      if (apiError instanceof SovraIdApiError) {
        return NextResponse.json({
          credentialId: credential.id,
          localStatus: credential.status,
          sovraIdStatus: null,
          synced: false,
          error: {
            code: apiError.code,
            message: apiError.message,
          },
          message: `Error al consultar SovraID: ${apiError.message}`,
          isMock: false,
        });
      }

      throw apiError;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('[Credential Status] Error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
