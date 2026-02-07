import { logger } from '@/lib/logger';
/**
 * Email Client - Gmail SMTP
 *
 * Sends emails via Gmail SMTP using nodemailer.
 * Requires App Password for Google Workspace accounts.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

/**
 * Get or create the email transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!user || !pass) {
      throw new Error(
        'Email configuration missing. Please set SMTP_USER and SMTP_PASSWORD environment variables.'
      );
    }

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user,
        pass,
      },
    });
  }

  return transporter;
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

/**
 * Send an email
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!isEmailConfigured()) {
      logger.warn('[Email] SMTP not configured, skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    const transport = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const result = await transport.sendMail({
      from: `Sovra Partners <${from}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    logger.debug('[Email] Sent successfully:', { messageId: result.messageId });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('[Email] Failed to send:', { error: error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    if (!isEmailConfigured()) {
      return false;
    }

    const transport = getTransporter();
    await transport.verify();
    logger.debug('[Email] SMTP connection verified');
    return true;
  } catch (error) {
    logger.error('[Email] SMTP connection failed:', { error: error });
    return false;
  }
}
