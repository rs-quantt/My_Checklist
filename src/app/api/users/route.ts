import { NextResponse } from 'next/server';
import { createUser, getUsers } from '@/services/userService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || undefined;

    const users = await getUsers(offset, limit, search);
    return NextResponse.json(users);
  } catch (error) {
    console.log(
      error instanceof Error ? error.message : 'Something went wrong',
    );
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    const userData = {
      name,
      email,
      role: 'user', // Set default role to 'user' if not provided
      hashedPassword: '', // Set default hashedPassword to empty string
    };
    const newUser = await createUser(userData);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.log(
      error instanceof Error ? error.message : 'Something went wrong',
    );
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
