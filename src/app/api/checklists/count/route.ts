import { NextResponse } from 'next/server';
import { countChecklists } from '@/services/checklistService';

export async function GET() {
  try {
    const count = await countChecklists();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error in GET /api/checklists/count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}