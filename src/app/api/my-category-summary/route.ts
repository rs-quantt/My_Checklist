import { getMyCategorySummaries } from '@/services/categoryService'; // Assuming a new service function
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const categorySummaries = await getMyCategorySummaries(userId);
    return NextResponse.json(categorySummaries);
  } catch (error) {
    console.error('Error fetching my category summaries:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
