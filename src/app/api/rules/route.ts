import { NextResponse } from 'next/server';
import { getRules } from '@/services/ruleService';

export async function GET() {
  try {
    const rules = await getRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
