import { NextResponse } from 'next/server';
import { getMyCategorySummaryDetailById } from '@/services/categoryService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const categorySummary = await getMyCategorySummaryDetailById(id);

    if (!categorySummary) {
      return NextResponse.json({ error: 'Category Summary not found' }, { status: 404 });
    }

    return NextResponse.json(categorySummary);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 },
    );
  }
}
