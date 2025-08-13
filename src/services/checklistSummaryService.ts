import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

// Define a type for the summary object to ensure type safety
interface ChecklistSummary {
  _id: string;
  updatedAt: string; // Changed from _updatedAt
  taskCode: string;
  passedItems: number;
  totalItems: number;
  user: {
    _id: string;
    name: string;
  };
  checklist: {
    _id: string;
    title: string;
  };
  items: {
    _key: string;
    itemId: string;
    status: 'done' | 'incomplete' | 'na';
    note?: string;
  }[];
}

export async function getChecklistSummaryCount(options?: {
  search?: string;
}): Promise<number> {
  try {
    const { search = '' } = options || {};
    let query = `count(*[_type == "checklistSummary"`;
    const params: { search?: string } = {};

    if (search) {
      query += ` && taskCode match $search`;
      params.search = `*${search}*`;
    }

    query += `])`;

    const count = await client.fetch(query, params);
    return count || 0;
  } catch (error) {
    console.error('Error fetching checklist summary count:', error);
    throw new Error('Failed to fetch checklist summary count');
  }
}

export async function getChecklistSummaryDistribution(checklistId?: string) {
  try {
    let query = groq`*[_type == "checklistSummary"`;
    const params: { checklistId?: string } = {};

    if (checklistId) {
      query += ` && checklist._ref == $checklistId`;
      params.checklistId = checklistId;
    }

    query += `]{ "checklistTitle": checklist->title }`;

    const summaries: { checklistTitle: string }[] = await client.fetch(
      query,
      params,
    );

    if (!summaries || summaries.length === 0) {
      return [];
    }

    const distribution = summaries.reduce(
      (acc: Record<string, number>, summary: { checklistTitle: string }) => {
        const title = summary.checklistTitle || 'Untitled';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error) {
    console.error('Error fetching checklist summary distribution:', error);
    throw new Error('Failed to fetch checklist summary distribution');
  }
}

export async function getChecklistSummaries(options?: {
  offset?: number;
  limit?: number;
  search?: string;
  userId?: string;
}): Promise<ChecklistSummary[]> {
  try {
    const { offset = 0, limit = 10, search = '', userId } = options || {};
    let query = `*[_type == "checklistSummary"`;
    const params: { offset: number; limit: number; search?: string; userId?: string } = {
      offset,
      limit,
    };

    if (search) {
      query += ` && taskCode match $search`;
      params.search = `*${search}*`;
    }

    if (userId) {
      query += ` && user._ref == $userId`;
      params.userId = userId;
    }

    query += `] {
      _id,
      updatedAt,
      taskCode,
      totalItems,
      passedItems,
      user->{
        _id,
        name
      },
      checklist->{
        _id,
        title,
        description,
        'items': items[]{
          _key,
          _id,
          label,
          description,
          priority
        }
      },
      items[]{
        _key,
        itemId,
        status,
        note
      }
    } | order(updatedAt desc) [$offset...$offset + $limit]`; // Changed from _updatedAt

    const summaries = await client.fetch(query, params);
    return summaries;
  } catch (error) {
    console.error('Error fetching checklist summaries:', error);
    throw new Error('Failed to fetch checklist summaries');
  }
}
