import { NextRequest, NextResponse } from 'next/server';
import { saveUserChecklistItems } from '@/services/checklistService';

export async function POST(req: NextRequest) {
  try {
    const { userId, taskCode, items } = await req.json();

    if (!userId || !taskCode || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    // Call the service function to handle saving the checklist items
    const result = await saveUserChecklistItems(userId, taskCode, items);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
