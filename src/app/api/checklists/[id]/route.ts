import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.server';
import { NextResponse } from 'next/server';

// Sử dụng kiểu dữ liệu rõ ràng cho params
interface Params {
  id: string;
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function GET(request: Request, context: { params: Params }) {
  const { id } = context.params;

  const checklist = await client.fetch(`
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
  `, { id });

  if (!checklist) {
    return new NextResponse('Checklist not found', { status: 404 });
  }

  return NextResponse.json(checklist);
}
