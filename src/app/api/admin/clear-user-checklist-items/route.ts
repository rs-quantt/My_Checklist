import { clearUserChecklistItems } from '@/services/adminService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await clearUserChecklistItems();
    return NextResponse.json(
      { message: 'All user checklist item data deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { message: 'Failed to delete user checklist item data' },
      { status: 500 },
    );
  }
}
