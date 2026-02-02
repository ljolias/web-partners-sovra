import { Resend } from 'resend';
import type { Deal, Partner, User } from '@/types';

// Lazy initialization to avoid errors during build when API key is not set
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'Sovra Partners <noreply@sovra.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partners.sovra.io';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.log('Email not sent (no API key):', { to, subject });
    return false;
  }

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">SOVRA</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Portal de Partners</p>
          </div>
          <div style="padding: 32px;">
            ${content}
          </div>
          <div style="background-color: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Este es un mensaje automatico del Portal de Partners de Sovra.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function ctaButton(text: string, url: string): string {
  return `
    <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
      ${text}
    </a>
  `;
}

export async function sendDealApprovedEmail(
  deal: Deal,
  partner: Partner,
  user: User
): Promise<boolean> {
  const quoteUrl = `${APP_URL}/es/partners/portal/deals/${deal.id}/quote`;

  const html = baseTemplate(`
    <h2 style="color: #111827; margin: 0 0 16px 0;">Tu oportunidad fue aprobada</h2>

    <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="color: #047857; margin: 0; font-weight: 600;">Buenas noticias!</p>
      <p style="color: #047857; margin: 8px 0 0 0;">
        La oportunidad <strong>${deal.clientName}</strong> ha sido aprobada por el equipo de Sovra.
      </p>
    </div>

    <p style="color: #4b5563; margin-bottom: 24px;">
      Ya puedes crear una cotizacion para esta oportunidad. Nuestro configurador te ayudara a generar una propuesta profesional con los productos y servicios que necesita tu cliente.
    </p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${deal.clientName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Pais:</strong> ${deal.country}</p>
      <p style="margin: 0;"><strong>Poblacion:</strong> ${deal.population.toLocaleString()} habitantes</p>
    </div>

    <div style="text-align: center;">
      ${ctaButton('Crear Cotizacion', quoteUrl)}
    </div>
  `);

  return sendEmail({
    to: user.email,
    subject: `Tu oportunidad ${deal.clientName} fue aprobada`,
    html,
  });
}

export async function sendDealRejectedEmail(
  deal: Deal,
  partner: Partner,
  user: User,
  reason: string
): Promise<boolean> {
  const dealsUrl = `${APP_URL}/es/partners/portal/deals`;

  const html = baseTemplate(`
    <h2 style="color: #111827; margin: 0 0 16px 0;">Actualizacion sobre tu oportunidad</h2>

    <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="color: #991b1b; margin: 0; font-weight: 600;">Oportunidad no aprobada</p>
      <p style="color: #991b1b; margin: 8px 0 0 0;">
        Lamentablemente, la oportunidad <strong>${deal.clientName}</strong> no ha sido aprobada en esta ocasion.
      </p>
    </div>

    <p style="color: #4b5563; margin-bottom: 16px;">
      <strong>Razon:</strong>
    </p>
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #374151;">${reason}</p>
    </div>

    <p style="color: #4b5563; margin-bottom: 24px;">
      Si tienes alguna pregunta o deseas discutir esta decision, no dudes en contactar a tu gerente de canal.
    </p>

    <div style="text-align: center;">
      ${ctaButton('Ver mis oportunidades', dealsUrl)}
    </div>
  `);

  return sendEmail({
    to: user.email,
    subject: `Actualizacion sobre tu oportunidad ${deal.clientName}`,
    html,
  });
}

export async function sendDealMoreInfoEmail(
  deal: Deal,
  partner: Partner,
  user: User,
  message: string
): Promise<boolean> {
  const dealUrl = `${APP_URL}/es/partners/portal/deals/${deal.id}`;

  const html = baseTemplate(`
    <h2 style="color: #111827; margin: 0 0 16px 0;">Accion requerida</h2>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="color: #92400e; margin: 0; font-weight: 600;">Se necesita mas informacion</p>
      <p style="color: #92400e; margin: 8px 0 0 0;">
        El equipo de Sovra necesita informacion adicional sobre la oportunidad <strong>${deal.clientName}</strong>.
      </p>
    </div>

    <p style="color: #4b5563; margin-bottom: 16px;">
      <strong>Mensaje del equipo Sovra:</strong>
    </p>
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #374151;">${message}</p>
    </div>

    <p style="color: #4b5563; margin-bottom: 24px;">
      Por favor, actualiza la informacion de la oportunidad lo antes posible para que podamos continuar con el proceso de aprobacion.
    </p>

    <div style="text-align: center;">
      ${ctaButton('Completar informacion', dealUrl)}
    </div>
  `);

  return sendEmail({
    to: user.email,
    subject: `Accion requerida: ${deal.clientName}`,
    html,
  });
}
