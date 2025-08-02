import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.server';
import { NextResponse } from 'next/server';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

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
