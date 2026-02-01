import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAllTrainingModules } from '@/lib/redis';

export async function GET() {
  try {
    await requireSession();
    const modules = await getAllTrainingModules();

    return NextResponse.json({ modules });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get modules error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
