import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAllPartners } from '@/lib/redis';

// GET - List all partners (for Sovra Admin)
export async function GET() {
  try {
    const { user } = await requireSession();

    // Only Sovra Admin can access this
    if (user.role !== 'sovra_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const partners = await getAllPartners();

    // Sort by company name
    partners.sort((a, b) => (a.companyName || a.name).localeCompare(b.companyName || b.name));

    return NextResponse.json({ partners });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get partners error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
