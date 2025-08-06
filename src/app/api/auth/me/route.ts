import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-secret-key',
);

export async function GET(req: NextRequest) {
  const token = (await cookies()).get('__session')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ user: payload }, { status: 200 });
  } catch (error) {
    console.log(
      error instanceof Error ? error.message : 'Something went wrong',
    );
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
