
import { NextResponse } from 'next/server';
import { getChecklistSummaryById } from '@/services/checklistService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const checklist = await getChecklistSummaryById(id);

    if (!checklist) {
      return NextResponse.json({ message: 'Checklist not found' }, { status: 404 });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Error in GET /api/admin/checklists/[id]:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
