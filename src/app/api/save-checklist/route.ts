import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '@/sanity/env.server';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

export async function POST(req: NextRequest) {
  try {
    const { userId, itemId, status, note, taskCode } = await req.json();

    if (!userId || !itemId || !status || !taskCode) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const docId = `${userId}-${itemId}`;

    const result = await client.createOrReplace({
      _id: docId,
      _type: 'userChecklistItem',
      user: { _type: 'reference', _ref: userId },
      item: { _type: 'reference', _ref: itemId },
      status,
      note,
      taskCode,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
