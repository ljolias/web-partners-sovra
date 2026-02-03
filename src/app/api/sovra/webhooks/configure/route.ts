import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';

/**
 * GET /api/sovra/webhooks/configure
 *
 * Returns current webhook configuration and what URL to use
 */
export async function GET() {
  try {
    const { user } = await requireSession();

    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSovraIdConfigured()) {
      return NextResponse.json({
        error: 'SovraID not configured',
        message: 'Configure SOVRAID_API_URL, SOVRAID_API_KEY, and SOVRAID_WORKSPACE_ID first',
      }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web-partners-sovra.vercel.app';
    const webhookUrl = `${appUrl}/api/sovra/webhooks/sovraid`;
    const hasSecret = !!process.env.SOVRAID_WEBHOOK_SECRET;

    // Try to get current webhook status from workspace
    try {
      const client = getSovraIdClient();
      const workspaceStatus = await client.getWorkspaceStatus();

      return NextResponse.json({
        currentConfig: {
          url: workspaceStatus.webhook?.url || null,
          events: workspaceStatus.webhook?.events || [],
          active: workspaceStatus.webhook?.active || false,
        },
        recommended: {
          url: webhookUrl,
          events: ['credential.claimed', 'credential.revoked', 'verification.completed'],
        },
        secretConfigured: hasSecret,
        workspace: {
          id: workspaceStatus.id,
          name: workspaceStatus.name,
        },
      });
    } catch (error) {
      return NextResponse.json({
        currentConfig: null,
        recommended: {
          url: webhookUrl,
          events: ['credential.claimed', 'credential.revoked', 'verification.completed'],
        },
        secretConfigured: hasSecret,
        error: error instanceof Error ? error.message : 'Failed to get workspace status',
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/sovra/webhooks/configure
 *
 * Attempts to configure the webhook via SovraID API
 * If the API doesn't support this, returns instructions for manual configuration
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireSession();

    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSovraIdConfigured()) {
      return NextResponse.json({
        error: 'SovraID not configured',
      }, { status: 400 });
    }

    const body = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web-partners-sovra.vercel.app';
    const webhookUrl = body.url || `${appUrl}/api/sovra/webhooks/sovraid`;
    const events = body.events || ['credential.claimed', 'credential.revoked', 'verification.completed'];

    const client = getSovraIdClient();

    try {
      const result = await client.configureWebhook({
        url: webhookUrl,
        events,
      });

      return NextResponse.json({
        success: true,
        message: 'Webhook configured successfully via API',
        webhook: result.webhook,
      });
    } catch (apiError) {
      // If API configuration fails, provide manual instructions
      const isNotFound = apiError instanceof SovraIdApiError &&
        (apiError.code === 'HTTP_404' || apiError.code === 'HTTP_405');

      if (isNotFound) {
        return NextResponse.json({
          success: false,
          message: 'Webhook configuration via API not supported. Please configure manually.',
          manualConfiguration: {
            url: webhookUrl,
            events,
            instructions: [
              '1. Accede al dashboard de SovraID (sandbox.sovra.io o similar)',
              '2. Ve a la configuración de tu workspace',
              '3. En la sección de webhooks, configura:',
              `   - URL: ${webhookUrl}`,
              `   - Eventos: ${events.join(', ')}`,
              '4. Copia el webhook secret generado',
              '5. Agrega SOVRAID_WEBHOOK_SECRET en tus variables de entorno de Vercel',
            ],
          },
        }, { status: 200 }); // Return 200 because we're providing helpful info
      }

      throw apiError;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[Webhook Configure] Error:', error);

    if (error instanceof SovraIdApiError) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
