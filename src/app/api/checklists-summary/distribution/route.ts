import { NextResponse } from 'next/server';
import { getChecklistSummaryDistribution } from '@/services/checklistSummaryService';

export async function GET() {
  try {
    const distribution = await getChecklistSummaryDistribution();
    return NextResponse.json(distribution);
  } catch (error) {
    console.error(
      'Error in GET /api/checklists-summary/distribution:',
      error,
    );
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch checklist summary distribution',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
