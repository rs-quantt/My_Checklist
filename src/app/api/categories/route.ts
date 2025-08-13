import { NextResponse } from 'next/server';
import { getCategories } from '@/services/categoryService';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}