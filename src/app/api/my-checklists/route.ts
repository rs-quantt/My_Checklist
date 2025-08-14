import { NextResponse } from 'next/server';
import { getChecklists, getChecklistById, saveUserChecklistItems } from '@/services/checklistService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const checklist = await getChecklistById(id);
      if (!checklist) {
        return NextResponse.json({ message: 'Checklist not found' }, { status: 404 });
      }
      return NextResponse.json({ checklist });
    } else {
      const checklists = await getChecklists();
      // Filter out common checklists as per the original logic in page.tsx
      const filteredChecklists = checklists.filter((template) => !template.isCommon);
      return NextResponse.json(filteredChecklists);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch checklists', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, taskCode, commitMessage, checklistId, items, categoryId } = await request.json();

    if (!userId || !taskCode || !checklistId || !items || !categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const summaryId = await saveUserChecklistItems(userId, checklistId, taskCode, commitMessage, items, categoryId);
    return NextResponse.json({ summaryId }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Failed to save checklist', error: (error as Error).message }, { status: 500 });
  }
}
