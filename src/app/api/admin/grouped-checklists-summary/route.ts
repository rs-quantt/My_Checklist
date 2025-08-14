import { NextResponse } from 'next/server';
import { getGroupedChecklistSummaries } from '@/services/checklistSummaryService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    const groupedSummaries = await getGroupedChecklistSummaries({ search: search || '' });
    return NextResponse.json(groupedSummaries);
  } catch (error) {
    console.error('API Error: Failed to fetch grouped admin checklist summaries', error);
    return NextResponse.json(
      { message: 'Failed to fetch grouped admin checklist summaries.' },
      { status: 500 },
    );
  }
}
