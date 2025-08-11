import { NextResponse } from 'next/server';
import { countUsers } from '@/services/userService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const count = await countUsers(search);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to count users:', error);
    return NextResponse.json(
      { error: 'Failed to count users' },
      { status: 500 },
    );
  }
}
