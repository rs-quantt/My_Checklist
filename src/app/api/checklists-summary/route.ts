import { getChecklistSummaries } from '@/services/checklistSummaryService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const search = searchParams.get('search') || '';

    if (isNaN(offset) || isNaN(limit) || offset < 0 || limit <= 0) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 },
      );
    }

    const summaries = await getChecklistSummaries({ offset, limit, search });
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching checklist summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
