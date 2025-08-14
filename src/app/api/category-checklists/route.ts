import { NextResponse } from 'next/server';
import { getChecklistsByCategoryId } from '@/services/checklistService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  if (!categoryId) {
    return NextResponse.json(
      { message: 'Category ID is required' },
      { status: 400 },
    );
  }

  try {
    const checklists = await getChecklistsByCategoryId(categoryId);
    return NextResponse.json(checklists);
  } catch (error) {
    console.error('API Error: Failed to fetch checklists by category', error);
    return NextResponse.json(
      { message: 'Failed to fetch checklists for the selected category.' },
      { status: 500 },
    );
  }
}
