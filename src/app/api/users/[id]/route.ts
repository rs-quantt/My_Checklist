import { NextResponse, NextRequest } from 'next/server';
import { deleteUser, updateUser } from '@/services/userService';
import { User } from '@/types/user';
import { getToken } from 'next-auth/jwt';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // No authorization code needed for delete, assuming it's an admin-only route already protected
    // or handled by NextAuth session on a higher level.
    // If a code is needed, similar logic to PUT should be applied.
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: Partial<Omit<User, '_id'>> & { isAdmin?: boolean; adminCode?: string } = await request.json();

    const { adminCode, ...userDataToUpdate } = body;

    // Get the current user's token to check their ID
    const token = await getToken({ req: request });

    // Prevent users from changing their own role
    if (token && token.sub === id) {
      return new NextResponse(JSON.stringify({ message: "You cannot change your own authority.", code: 403 }), { status: 403 });
    }

    // Authorization check for admin operations
    if (!process.env.AUTHORIZE_ADMIN_CODE) {
      console.error("AUTHORIZE_ADMIN_CODE is not defined in environment variables.");
      return new NextResponse(JSON.stringify({ message: "Server configuration error." }), { status: 500 });
    }

    if (!adminCode || adminCode !== process.env.AUTHORIZE_ADMIN_CODE) {
      return new NextResponse(JSON.stringify({ message: "Invalid authorization code." }), { status: 403 }); // Forbidden
    }

    const updatedUser = await updateUser(id, userDataToUpdate);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
