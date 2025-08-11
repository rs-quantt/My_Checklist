import { getChecklistSummaryCount } from '@/services/checklistSummaryService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const count = await getChecklistSummaryCount({ search });
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching checklist summary count:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
