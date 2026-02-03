/**
 * Email Service
 *
 * High-level functions for sending specific types of emails.
 */

import { sendEmail, isEmailConfigured } from './client';
import { credentialIssuedEmail, welcomeEmail } from './templates';

const PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partners.sovra.io';

/**
 * Send credential issuance email
 */
export async function sendCredentialEmail(params: {
  to: string;
  holderName: string;
  partnerName: string;
  role: string;
  qrCodeData?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.warn('[Email Service] SMTP not configured, skipping credential email');
    return { success: false, error: 'Email not configured' };
  }

  const template = credentialIssuedEmail({
    holderName: params.holderName,
    partnerName: params.partnerName,
    role: formatRole(params.role),
    qrCodeData: params.qrCodeData,
    portalUrl: `${PORTAL_URL}/es/partners/login`,
  });

  const result = await sendEmail({
    to: params.to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  if (result.success) {
    console.log(`[Email Service] Credential email sent to ${params.to}`);
  }

  return result;
}

/**
 * Send welcome email when credential is claimed
 */
export async function sendWelcomeEmail(params: {
  to: string;
  holderName: string;
  partnerName: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.warn('[Email Service] SMTP not configured, skipping welcome email');
    return { success: false, error: 'Email not configured' };
  }

  const template = welcomeEmail({
    holderName: params.holderName,
    partnerName: params.partnerName,
    portalUrl: `${PORTAL_URL}/es/partners/login`,
  });

  const result = await sendEmail({
    to: params.to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  if (result.success) {
    console.log(`[Email Service] Welcome email sent to ${params.to}`);
  }

  return result;
}

/**
 * Format role for display
 */
function formatRole(role: string): string {
  const roles: Record<string, string> = {
    admin: 'Administrador',
    admin_secondary: 'Administrador Secundario',
    sales: 'Ventas',
    legal: 'Legal',
  };
  return roles[role] || role;
}
