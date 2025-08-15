import { getAllIndividualCategorySummaries } from '@/services/categoryService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categorySummaries = await getAllIndividualCategorySummaries();
    return NextResponse.json(categorySummaries);
  } catch (error) {
    console.error('Error fetching all individual category summaries for admin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
