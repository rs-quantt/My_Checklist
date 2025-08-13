import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

export async function getCategories() {
  const query = groq`*[_type == "category"]{_id, title}`;
  try {
    const categories = await client.fetch(query);
    return categories;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch categories from Sanity');
  }
}