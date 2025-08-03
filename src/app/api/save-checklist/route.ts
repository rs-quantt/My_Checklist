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
    const { userId, taskCode, items } = await req.json();

    if (!userId || !taskCode || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    const transaction = client.transaction();

    for (const item of items) {
      const { itemId, status, note } = item;

      if (!itemId || !status) {
        console.warn(`Skipping item due to missing data: ${JSON.stringify(item)}`);
        continue;
      }

      const docId = `${userId}-${itemId}-${taskCode}`;

      transaction.createOrReplace({
        _id: docId,
        _type: 'userChecklistItem',
        user: { _type: 'reference', _ref: userId },
        item: { _type: 'reference', _ref: itemId },
        status,
        note: note || '',
        taskCode,
        updatedAt: new Date().toISOString(),
      });
    }

    const result = await transaction.commit();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
