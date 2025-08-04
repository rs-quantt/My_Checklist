import { NextResponse } from 'next/server';
import { getChecklists, createChecklist } from '@/services/checklistService';


export async function GET() {
  try {
    const checklists = await getChecklists();
    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Error in GET /api/checklists:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const checklistData = await request.json();
    const newChecklist = await createChecklist(checklistData);
    return NextResponse.json(newChecklist, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/checklists:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
