/**
 * Email Templates
 *
 * HTML and text templates for various emails.
 */

interface CredentialEmailParams {
  holderName: string;
  partnerName: string;
  role: string;
  qrCodeUrl?: string;
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
  const { holderName, partnerName, role, portalUrl } = params;

  const subject = `Tu credencial de acceso al Portal de Partners de Sovra`;

  const text = `
Hola ${holderName},

Se ha emitido una credencial verificable para que puedas acceder al Portal de Partners de Sovra como miembro de ${partnerName}.

Tu rol: ${role}

Para activar tu acceso:

1. Descarga Sovra Wallet desde App Store o Google Play
2. Escanea el codigo QR adjunto o el que te compartio tu administrador
3. Acepta la credencial en tu wallet
4. Ingresa al portal: ${portalUrl}

Si tienes dudas, contacta a tu administrador o escribe a partners@sovra.io

Saludos,
El equipo de Sovra
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu credencial de Sovra Partners</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); padding: 32px; text-align: center;">
              <img src="https://storage.googleapis.com/sovra-public/logo-white.png" alt="Sovra" width="120" style="margin-bottom: 16px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Portal de Partners</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 20px;">Hola ${holderName},</h2>

              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Se ha emitido una <strong>credencial verificable</strong> para que puedas acceder al Portal de Partners de Sovra como miembro de <strong>${partnerName}</strong>.
              </p>

              <!-- Role Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #E8F0FE; color: #0066FF; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                    Tu rol: ${role}
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 16px;">Para activar tu acceso:</h3>

              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: #0066FF; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 600; font-size: 14px;">1</td>
                        <td style="padding-left: 16px; color: #4a4a4a; font-size: 15px;">Descarga <strong>Sovra Wallet</strong> desde App Store o Google Play</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: #0066FF; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 600; font-size: 14px;">2</td>
                        <td style="padding-left: 16px; color: #4a4a4a; font-size: 15px;">Escanea el codigo QR que te compartio tu administrador</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: #0066FF; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 600; font-size: 14px;">3</td>
                        <td style="padding-left: 16px; color: #4a4a4a; font-size: 15px;">Acepta la credencial en tu wallet</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 32px; height: 32px; background-color: #0066FF; color: #fff; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 600; font-size: 14px;">4</td>
                        <td style="padding-left: 16px; color: #4a4a4a; font-size: 15px;">Ingresa al portal y comienza a trabajar</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto;">
                <tr>
                  <td style="background-color: #0066FF; border-radius: 8px;">
                    <a href="${portalUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Ir al Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #888; font-size: 14px; line-height: 1.5; margin: 0;">
                Si tienes dudas, contacta a tu administrador o escribe a <a href="mailto:partners@sovra.io" style="color: #0066FF;">partners@sovra.io</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 32px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 13px; margin: 0;">
                &copy; ${new Date().getFullYear()} Sovra. Todos los derechos reservados.
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

  const subject = `Bienvenido al Portal de Partners de Sovra`;

  const text = `
Hola ${holderName},

Tu credencial ha sido activada exitosamente. Ya puedes acceder al Portal de Partners de Sovra como miembro de ${partnerName}.

Ingresa aqui: ${portalUrl}

Saludos,
El equipo de Sovra
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Bienvenido!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; text-align: center;">
              <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px;">Hola ${holderName},</h2>

              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Tu credencial ha sido activada exitosamente.<br>
                Ya puedes acceder al Portal de Partners como miembro de <strong>${partnerName}</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #10B981; border-radius: 8px;">
                    <a href="${portalUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Ingresar al Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 32px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 13px; margin: 0;">
                &copy; ${new Date().getFullYear()} Sovra. Todos los derechos reservados.
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
