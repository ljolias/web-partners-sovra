/**
 * Email Templates - Sovra Brand Guidelines
 *
 * Design System (Light Theme):
 * - Background: #f8f9fa (outer), #ffffff (container)
 * - Primary Blue: #0099ff
 * - SovraWallet Purple: #a855f7
 * - Text: #1a1a2e (primary), #666666 (secondary)
 * - Container: Max-width 600px, 12px border-radius
 */

// QR Code API for generating QR codes
const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';
const QR_API_SMALL = 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=';

// Store URLs
const APP_STORE_URL = 'https://apps.apple.com/co/app/sovra/id6754286986';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pulsar.sovra&hl=es_AR';

// Base URL for assets
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partners.sovra.io';

// Logo URL (using deployed asset)
const SOVRA_LOGO_PNG = `${BASE_URL}/sovra.png`;

interface CredentialEmailParams {
  holderName: string;
  partnerName: string;
  role: string;
  qrCodeData?: string;
  portalUrl: string;
}

/**
 * Email sent when a credential is issued
 */
export function credentialIssuedEmail(params: CredentialEmailParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { holderName, partnerName, role, qrCodeData, portalUrl } = params;

  const qrCodeUrl = qrCodeData ? `${QR_API}${encodeURIComponent(qrCodeData)}` : '';

  const subject = `${holderName}, tu credencial de acceso está lista`;

  const text = `
Hola ${holderName},

Tu credencial verificable para acceder al Portal de Partners de Sovra está lista.

Partner: ${partnerName}
Rol: ${role}

Pasos para activar tu acceso:

1. Descarga SovraWallet
   - App Store: ${APP_STORE_URL}
   - Google Play: ${PLAY_STORE_URL}

2. Escanea el código QR de tu credencial (incluido en la versión HTML de este email)

3. Acepta la credencial en tu wallet

4. Ingresa al portal: ${portalUrl}

¿Dudas? Escribe a partners@sovra.io

Sovra - Trust once, use everywhere.
`.trim();

  // QR codes for store downloads
  const appStoreQR = `${QR_API_SMALL}${encodeURIComponent(APP_STORE_URL)}`;
  const playStoreQR = `${QR_API_SMALL}${encodeURIComponent(PLAY_STORE_URL)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu credencial de Sovra Partners</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Gradient Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(135deg, #0099ff 0%, #a855f7 50%, #f97316 100%);"></td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center;">
              <img src="${SOVRA_LOGO_PNG}" alt="Sovra" width="48" height="48" style="margin-bottom: 12px;">
              <h2 style="color: #1a1a2e; margin: 0; font-size: 20px; font-weight: 600;">Portal de Partners</h2>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">

              <!-- Greeting -->
              <h1 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">
                Hola ${holderName} 👋
              </h1>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Tu credencial verificable para acceder como miembro de <span style="color: #1a1a2e; font-weight: 600;">${partnerName}</span> está lista.
              </p>

              <!-- Role Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #E8F4FD; color: #0077cc; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                    Rol: ${role}
                  </td>
                </tr>
              </table>

              <!-- QR Code Section -->
              ${qrCodeUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #0099ff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">
                      Tu Credencial
                    </p>
                    <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                      <img src="${qrCodeUrl}" alt="QR Code de tu credencial" width="180" height="180" style="display: block;">
                    </div>
                    <p style="color: #666666; font-size: 13px; margin: 16px 0 0 0;">
                      Escanea este código con SovraWallet
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Steps Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td>
                    <p style="color: #1a1a2e; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                      ¿Cómo activar tu acceso?
                    </p>
                  </td>
                </tr>

                <!-- Step 1: Download Wallet -->
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #ffffff; font-weight: 600; font-size: 14px;">1</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #1a1a2e; font-size: 15px; font-weight: 500; margin: 0 0 8px 0;">
                            Descarga SovraWallet
                          </p>
                          <p style="color: #666666; font-size: 13px; margin: 0 0 12px 0;">
                            Disponible en App Store y Google Play
                          </p>
                          <!-- Store Buttons -->
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 8px;">
                                <a href="${APP_STORE_URL}" style="display: inline-block; background-color: #1a1a2e; color: #ffffff; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
                                  🍎 App Store
                                </a>
                              </td>
                              <td>
                                <a href="${PLAY_STORE_URL}" style="display: inline-block; background-color: #1a1a2e; color: #ffffff; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
                                  🤖 Google Play
                                </a>
                              </td>
                            </tr>
                          </table>
                          <!-- QR codes for PC users -->
                          <p style="color: #888888; font-size: 11px; margin: 12px 0 8px 0;">
                            ¿Estás en PC? Escanea para descargar:
                          </p>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 16px; text-align: center;">
                                <div style="background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e5e7eb; display: inline-block;">
                                  <img src="${appStoreQR}" alt="App Store QR" width="70" height="70" style="display: block;">
                                </div>
                                <p style="color: #888888; font-size: 10px; margin: 4px 0 0 0;">App Store</p>
                              </td>
                              <td style="text-align: center;">
                                <div style="background-color: #ffffff; padding: 8px; border-radius: 8px; border: 1px solid #e5e7eb; display: inline-block;">
                                  <img src="${playStoreQR}" alt="Play Store QR" width="70" height="70" style="display: block;">
                                </div>
                                <p style="color: #888888; font-size: 10px; margin: 4px 0 0 0;">Google Play</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height: 12px;"></td></tr>

                <!-- Step 2: Scan QR -->
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #0099ff 0%, #0077cc 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #ffffff; font-weight: 600; font-size: 14px;">2</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #1a1a2e; font-size: 15px; font-weight: 500; margin: 0 0 4px 0;">
                            Escanea el QR de tu credencial
                          </p>
                          <p style="color: #666666; font-size: 13px; margin: 0;">
                            Abre SovraWallet y escanea el código QR de arriba
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height: 12px;"></td></tr>

                <!-- Step 3: Accept -->
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #ffffff; font-weight: 600; font-size: 14px;">3</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #1a1a2e; font-size: 15px; font-weight: 500; margin: 0 0 4px 0;">
                            Acepta la credencial
                          </p>
                          <p style="color: #666666; font-size: 13px; margin: 0;">
                            Revisa los datos y acepta para guardarla en tu wallet
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height: 12px;"></td></tr>

                <!-- Step 4: Access Portal -->
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #ffffff; font-weight: 600; font-size: 14px;">4</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: #1a1a2e; font-size: 15px; font-weight: 500; margin: 0 0 4px 0;">
                            ¡Listo! Ingresa al portal
                          </p>
                          <p style="color: #666666; font-size: 13px; margin: 0;">
                            Usa tu credencial para acceder al Portal de Partners
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #0099ff 0%, #0077cc 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Ir al Portal de Partners
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 8px 0;">
                ¿Dudas? Escribe a <a href="mailto:partners@sovra.io" style="color: #0099ff; text-decoration: none;">partners@sovra.io</a>
              </p>
              <p style="color: #888888; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Sovra · Trust once, use everywhere.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
}

/**
 * Email sent when a credential is claimed (welcome email)
 */
export function welcomeEmail(params: {
  holderName: string;
  partnerName: string;
  portalUrl: string;
}): {
  subject: string;
  text: string;
  html: string;
} {
  const { holderName, partnerName, portalUrl } = params;

  const subject = `¡Bienvenido al Portal de Partners, ${holderName}!`;

  const text = `
Hola ${holderName},

Tu credencial ha sido activada exitosamente. Ya puedes acceder al Portal de Partners de Sovra como miembro de ${partnerName}.

Ingresa aquí: ${portalUrl}

Sovra - Trust once, use everywhere.
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Gradient Bar (Green for success) -->
          <tr>
            <td style="height: 4px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);"></td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center;">
              <img src="${SOVRA_LOGO_PNG}" alt="Sovra" width="48" height="48" style="margin-bottom: 8px;">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 32px 40px 32px; text-align: center;">

              <!-- Success Icon -->
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; margin: 0 auto 24px auto; line-height: 64px; font-size: 32px; color: #ffffff;">
                ✓
              </div>

              <h1 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 28px; font-weight: 600;">
                ¡Bienvenido, ${holderName}!
              </h1>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Tu credencial ha sido activada exitosamente.<br>
                Ya eres parte del equipo de <span style="color: #1a1a2e; font-weight: 600;">${partnerName}</span>.
              </p>

              <!-- CTA Button -->
              <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
                Ingresar al Portal
              </a>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 8px 0;">
                ¿Dudas? Escribe a <a href="mailto:partners@sovra.io" style="color: #0099ff; text-decoration: none;">partners@sovra.io</a>
              </p>
              <p style="color: #888888; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Sovra · Trust once, use everywhere.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
}
