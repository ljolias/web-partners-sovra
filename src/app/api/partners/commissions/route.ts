import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getPartnerCommissions } from '@/lib/redis';

export async function GET() {
  try {
    const { partner } = await requireSession();
    const commissions = await getPartnerCommissions(partner.id);

    // Calculate totals
    const total = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pending = commissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
    const paid = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      commissions,
      totals: { total, pending, paid },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get commissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
