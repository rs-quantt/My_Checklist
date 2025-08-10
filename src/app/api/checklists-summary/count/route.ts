import { getChecklistSummaryCount } from '@/services/checklistSummaryService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await getChecklistSummaryCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching checklist summary count:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
