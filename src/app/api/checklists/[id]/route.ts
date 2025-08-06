import { NextResponse } from 'next/server';
import { getChecklistById } from '@/services/checklistService';
import { getUsers } from '@/services/userService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Correctly await the params object to resolve its properties, as required by Next.js
  const { id } = await params;

  if (!id) {
    return new NextResponse('Checklist ID is required', { status: 400 });
  }

  try {
    // Fetch both checklist and users concurrently for better performance
    const [checklist, users] = await Promise.all([
      getChecklistById(id),
      getUsers(),
    ]);

    if (!checklist) {
      return new NextResponse(`Checklist with ID ${id} not found`, { status: 404 });
    }

    // Return a single JSON object containing both checklist and users
    return NextResponse.json({ checklist, users });

  } catch (error) {
    console.error(`Error fetching details for checklist ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), { status: 500 });
  }
}
