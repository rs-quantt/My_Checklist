'use client'; // Nếu App Router
import { useEffect, useState } from 'react';
import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { apiVersion, dataset, projectId } from '@/sanity/env.server';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

type ChecklistItem = {
  _id: string;
  label: string;
  description?: string;
  order?: number;
};

type Checklist = {
  _id: string;
  title: string;
  type: string;
  items: ChecklistItem[];
};

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await client.fetch(`
        *[_type == "checklist"]{
          _id,
          title,
          type,
          "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){
            _id,
            label,
            description,
            order
          }
        }
      `);
      setChecklists(result);
    };
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Checklists</h1>
      {checklists.map((checklist) => (
        <div key={checklist._id} className="mb-10 border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            {checklist.title} ({checklist.type})
          </h2>
          <ul className="list-disc pl-6">
            {checklist.items.map((item) => (
              <li key={item._id} className="mb-1">
                <span className="font-medium">{item.label}</span>:{' '}
                {item.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
