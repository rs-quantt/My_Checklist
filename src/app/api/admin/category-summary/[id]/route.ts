import { getMyCategorySummaryDetailById } from '@/services/categoryService';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // This 'id' is the categorySummary _id
    const categoryDetail = await getMyCategorySummaryDetailById(id);

    if (!categoryDetail) {
      return NextResponse.json({ error: 'Category Summary not found' }, { status: 404 });
    }

    return NextResponse.json(categoryDetail);
  } catch (error) {
    console.error('Error fetching category summary detail for admin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
