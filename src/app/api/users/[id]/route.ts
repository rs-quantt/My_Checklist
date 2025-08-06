import { NextResponse } from 'next/server';
import { deleteUser } from '@/services/userService';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteUser(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log(
      error instanceof Error ? error.message : 'Something went wrong',
    );
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
