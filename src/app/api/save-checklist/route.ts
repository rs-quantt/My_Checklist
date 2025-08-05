import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '@/sanity/env.server';
import { NextResponse } from 'next/server';
import { saveUserChecklistItems } from '@/services/checklistService'; // Import the service function

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const { userId, taskCode, checklistId, items } = payload; 

    if (
      !userId ||
      !taskCode ||
      !checklistId || // checklistId is not directly used by saveUserChecklistItems, but good for initial validation
      !items ||
      !Array.isArray(items)
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters or invalid items format in payload',
        },
        { status: 400 },
      );
    }

    // Call the service function to save user checklist items and update the summary
    await saveUserChecklistItems(userId, taskCode, items);

    return NextResponse.json({ message: 'Checklist saved successfully!' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
