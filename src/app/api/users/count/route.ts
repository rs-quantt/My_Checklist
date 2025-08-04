import { NextResponse } from 'next/server';
import { countUsers } from '@/services/userService';

export async function GET() {
  try {
    const userCount = await countUsers();
    return NextResponse.json({ count: userCount });
  } catch (error) {
    console.error('Error in GET /api/users/count:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}