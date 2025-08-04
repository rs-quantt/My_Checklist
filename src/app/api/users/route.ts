import { NextResponse } from 'next/server';
import { createUser, getUsers } from '@/services/userService';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
