import { NextResponse } from 'next/server';
import {
  getChecklistById,
  updateChecklist,
  deleteChecklist,
} from '@/services/checklistService';
import { client } from '@/sanity/lib/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const checklist = await client.fetch(
    `
    *[_type == "checklist" && _id == $id][0]{
      _id,
      title,
      description,
      // Đã xóa type,
      "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){
        _id,
        label,
        description,
        order
      }
    }
  `,
    { id },
  ); // Explicitly type the context parameter

  if (!checklist) {
    return new NextResponse('Checklist not found', { status: 404 });
  }

  return NextResponse.json(checklist);
}
