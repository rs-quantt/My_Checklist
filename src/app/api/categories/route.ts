import { NextResponse } from 'next/server';
import { getCategories } from '@/services/categoryService';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
