import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import {
  getPartnerCredential,
  getPartner,
} from '@/lib/redis';

interface RouteParams {
  params: Promise<{ credentialId: string }>;
}

// POST - Resend QR code email
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireSession();
    const { credentialId } = await params;

    // Only Sovra Admin can resend QR
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const credential = await getPartnerCredential(credentialId);
    if (!credential) {
      return NextResponse.json({ error: 'Credencial no encontrada' }, { status: 404 });
    }

    if (credential.status === 'revoked') {
      return NextResponse.json({ error: 'No se puede reenviar QR de credencial revocada' }, { status: 400 });
    }

    if (credential.status === 'active') {
      return NextResponse.json({ error: 'La credencial ya esta activa' }, { status: 400 });
    }

    // Get partner for email context
    const partner = await getPartner(credential.partnerId);

    // TODO: Send email with QR code and instructions
    // await sendCredentialEmail(
    //   credential.holderEmail,
    //   credential.holderName,
    //   partner?.companyName || 'Partner',
    //   credential.qrCode
    // );

    logger.debug('[Mock] Resending QR to for credential', { holderEmail: credential.holderEmail, credentialId: credentialId });

    return NextResponse.json({
      message: 'QR reenviado exitosamente.',
      credential,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('Resend QR error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
