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
      !checklistId ||
      !items ||
      !Array.isArray(items)
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: userId, taskCode, checklistId, and items are required.',
        },
        { status: 400 },
      );
    }

    // Correctly call the service function with all required parameters
    await saveUserChecklistItems(userId, checklistId, taskCode, items);

    return NextResponse.json({ message: 'Checklist saved successfully!' });
  } catch (error) {
    console.error('API error:', error);
    // It's better to cast error to Error type to access message property safely
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 },
    );
  }
}
