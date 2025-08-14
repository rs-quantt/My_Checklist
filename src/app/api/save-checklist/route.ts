import { NextResponse } from 'next/server';
import { saveUserChecklistItems } from '@/services/checklistService';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { userId, taskCode, checklistId, items, commitMessage, categoryId } = payload;

    if (!userId || !taskCode || !checklistId || !items || !Array.isArray(items) || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    const summaryId = await saveUserChecklistItems(
      userId,
      checklistId,
      taskCode,
      commitMessage || '',
      items,
      categoryId,
    );

    return NextResponse.json({
      message: 'Checklist saved successfully!',
      summaryId,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 },
    );
  }
}
