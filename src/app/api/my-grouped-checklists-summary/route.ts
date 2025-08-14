import { NextResponse } from 'next/server';
import { getGroupedChecklistSummaries } from '@/services/checklistSummaryService';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  const session = await getServerSession(); // No need to pass authOptions explicitly

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    const groupedSummaries = await getGroupedChecklistSummaries({ userId: session.user.id, search: search || '' });
    return NextResponse.json(groupedSummaries);
  } catch (error) {
    console.error('API Error: Failed to fetch grouped user checklist summaries', error);
    return NextResponse.json(
      { message: 'Failed to fetch grouped user checklist summaries.' },
      { status: 500 },
    );
  }
}
