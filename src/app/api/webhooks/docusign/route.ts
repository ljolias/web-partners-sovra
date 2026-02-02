import { NextRequest, NextResponse } from 'next/server';
import { processWebhookEvent } from '@/lib/docusign/webhooks';

// DocuSign Connect webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const payload = await request.text();

    // Get signature from headers
    // DocuSign sends the signature in x-docusign-signature-1 header
    const signature =
      request.headers.get('x-docusign-signature-1') ||
      request.headers.get('x-docusign-signature') ||
      '';

    if (!signature) {
      console.warn('DocuSign webhook received without signature');
      // In development, we might want to process anyway
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
    }

    // Process the webhook event
    const result = await processWebhookEvent(payload, signature);

    if (!result.success) {
      console.error('DocuSign webhook processing failed:', result.message);
      // Return 200 to prevent DocuSign from retrying for non-critical errors
      // Return 4xx/5xx for critical errors that should be retried
      if (result.message === 'Invalid webhook signature') {
        return NextResponse.json({ error: result.message }, { status: 401 });
      }
      // For other errors, acknowledge receipt to prevent retry loops
      return NextResponse.json({ received: true, warning: result.message }, { status: 200 });
    }

    console.log('DocuSign webhook processed:', result.message);
    return NextResponse.json({ received: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error('DocuSign webhook error:', error);
    // Return 500 to trigger DocuSign retry
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DocuSign may send GET requests to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'DocuSign webhook endpoint active' }, { status: 200 });
}
