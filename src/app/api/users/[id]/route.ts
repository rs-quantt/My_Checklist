import { NextResponse } from 'next/server';
import { deleteUser, updateUser } from '@/services/userService';
import { User } from '@/types/user';

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: Omit<User, '_id'> = await request.json();

    const updatedUser = await updateUser(id, body);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
