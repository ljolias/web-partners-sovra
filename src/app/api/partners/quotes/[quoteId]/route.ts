import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getQuote } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ quoteId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { quoteId } = await params;
    const { partner } = await requireSession();

    const quote = await getQuote(quoteId);
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify quote belongs to partner
    if (quote.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
