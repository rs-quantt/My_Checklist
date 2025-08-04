import { NextRequest, NextResponse } from 'next/server';
import { saveUserChecklistItems } from '@/services/checklistService';
import { client } from '@/sanity/lib/client';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (payload._type === 'checklistSummary') {
      // Handle checklist summary payload
      const { _type, user, checklist, totalItems, passedItems, resultText } = payload;

      if (!user?._ref || !checklist?._ref || totalItems === undefined || passedItems === undefined || !resultText) {
        return NextResponse.json({ error: 'Missing or invalid summary data' }, { status: 400 });
      }

      const docId = `${user._ref}-${checklist._ref}`;

      const result = await client.createOrReplace({
        _id: docId,
        _type: 'checklistSummary',
        user: user,
        checklist: checklist,
        totalItems: totalItems,
        passedItems: passedItems,
        resultText: resultText,
        _createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: 'Checklist summary saved successfully', result });
    } else {
      // Handle user checklist items payload (existing logic)
      const { userId, taskCode, items } = payload;

      if (!userId || !taskCode || !items || !Array.isArray(items)) {
        return NextResponse.json({ error: 'Missing or invalid user checklist data' }, { status: 400 });
      }

      const result = await saveUserChecklistItems(userId, taskCode, items);

      return NextResponse.json({ success: true, result });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
