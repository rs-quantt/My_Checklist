import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

// Define a type for the summary object to ensure type safety
interface ChecklistSummary {
  _id: string;
  _updatedAt: string;
  taskCode: string;
  totalItems: number;
  passedItems: number;
  user: {
    _id: string;
    name: string;
  };
  checklist: {
    _id: string;
    title: string;
  };
}

const checklistSummaryCountQuery = groq`
  count(*[_type == "checklistSummary"])
`;

export async function getChecklistSummaryCount(): Promise<number> {
  try {
    const count = await client.fetch(checklistSummaryCountQuery);
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
  offset: number;
  limit: number;
}): Promise<ChecklistSummary[]> {
  try {
    const { offset = 0, limit = 10 } = options || {};
    const query = groq`*[_type == "checklistSummary"] {
      _id,
      _updatedAt,
      taskCode,
      totalItems,
      passedItems,
      user->{
        _id,
        name
      },
      checklist->{
        _id,
        title
      }
    } | order(_updatedAt desc) [$offset...$offset + $limit]`;

    const params = { offset, limit };
    const summaries = await client.fetch(query, params);
    return summaries;
  } catch (error) {
    console.error('Error fetching checklist summaries:', error);
    throw new Error('Failed to fetch checklist summaries');
  }
}
