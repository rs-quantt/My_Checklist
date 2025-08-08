import { NextResponse } from 'next/server';
import { getChecklistSummaryCount } from '@/services/checklistSummaryService';

export async function GET() {
  try {
    const count = await getChecklistSummaryCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error in GET /api/checklists-summary/count:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch checklist summary count' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
