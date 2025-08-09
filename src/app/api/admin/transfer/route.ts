import { NextRequest, NextResponse } from 'next/server';
import { transferChecklistItems } from '@/services/transferService';

interface TransferRequestBody {
  sourceId: string;
  destinationIds: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { sourceId, destinationIds }: TransferRequestBody = await req.json();

    await transferChecklistItems(sourceId, destinationIds);

    return NextResponse.json({ message: 'Items transferred successfully.' });
  } catch (error: unknown) {
    console.error('Transfer failed:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details:
          error instanceof Error ? error.message : 'Something went wrong!',
      },
      { status: 400 },
    );
  }
}
