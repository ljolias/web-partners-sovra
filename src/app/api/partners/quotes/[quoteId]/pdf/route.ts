import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { requireSession } from '@/lib/auth';
import { getQuote, getDeal, getPartner } from '@/lib/redis';
import { QuotePDF } from '@/lib/pdf/QuotePDF';

interface RouteParams {
  params: Promise<{ quoteId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { quoteId } = await params;
    const { partner } = await requireSession();

    // Get quote
    const quote = await getQuote(quoteId);
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify quote belongs to partner
    if (quote.partnerId !== partner.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get deal
    const deal = await getDeal(quote.dealId);
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Get partner info
    const partnerInfo = await getPartner(partner.id);
    if (!partnerInfo) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      QuotePDF({ quote, deal, partner: partnerInfo })
    );

    // Create filename
    const filename = `Cotizacion_${deal.clientName.replace(/\s+/g, '_')}_v${quote.version}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Generate PDF error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
