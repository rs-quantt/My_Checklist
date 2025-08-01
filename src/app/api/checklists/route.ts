import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.server';
import { NextResponse } from 'next/server';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function GET() {
  const checklists = await client.fetch(`
    *[_type == "checklist"]{
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
  `);
  return NextResponse.json(checklists);
}
