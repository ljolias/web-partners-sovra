import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireSession } from '@/lib/auth';
import { getSovraIdClient, isSovraIdConfigured, SovraIdApiError } from '@/lib/sovraid';

/**
 * GET /api/sovra/sovraid/status
 *
 * Returns the current SovraID integration status
 * Useful for admin dashboard to show if credentials will use real API or mock
 */
export async function GET() {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can check status
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const configured = isSovraIdConfigured();

    if (!configured) {
      return NextResponse.json({
        configured: false,
        status: 'not_configured',
        message: 'SovraID environment variables not set. Using mock credentials.',
        missingVars: getMissingVars(),
      });
    }

    // Try to connect and get workspace status
    try {
      const client = getSovraIdClient();
      const workspaceStatus = await client.getWorkspaceStatus();

      return NextResponse.json({
        configured: true,
        status: 'connected',
        message: 'SovraID is properly configured and connected.',
        workspace: {
          id: workspaceStatus.id,
          name: workspaceStatus.name,
          did: workspaceStatus.did,
          webhookConfigured: !!workspaceStatus.webhook?.active,
        },
      });
    } catch (apiError) {
      logger.error('[SovraID Status] API error:', { error: apiError });

      if (apiError instanceof SovraIdApiError) {
        return NextResponse.json({
          configured: true,
          status: 'error',
          message: `SovraID API error: ${apiError.message}`,
          error: {
            code: apiError.code,
            message: apiError.message,
          },
        });
      }

      return NextResponse.json({
        configured: true,
        status: 'error',
        message: 'Failed to connect to SovraID API',
        error: {
          message: apiError instanceof Error ? apiError.message : 'Unknown error',
        },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    logger.error('[SovraID Status] Error:', { error: error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getMissingVars(): string[] {
  const missing: string[] = [];
  if (!process.env.SOVRAID_API_URL) missing.push('SOVRAID_API_URL');
  if (!process.env.SOVRAID_API_KEY) missing.push('SOVRAID_API_KEY');
  if (!process.env.SOVRAID_WORKSPACE_ID) missing.push('SOVRAID_WORKSPACE_ID');
  return missing;
}
