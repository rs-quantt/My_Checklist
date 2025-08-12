import { NextResponse } from 'next/server';
import { getRuleById } from '@/services/ruleService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('Rule ID is required', { status: 400 });
  }

  try {
    const rule = await getRuleById(id);

    if (!rule) {
      return new NextResponse(`Rule with ID ${id} not found`, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error(`Error fetching rule ${id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
