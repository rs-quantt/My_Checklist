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
    description?: string;
    category?: {
      _id: string;
      title: string;
    };
  };
  items: {
    _key: string;
    itemId: string;
    status: 'done' | 'incomplete' | 'na';
    note?: string;
  }[];
}

// New type for grouped summaries
interface GroupedChecklistSummary {
  categoryId: string;
  categoryTitle: string;
  taskCodeGroups: {
    taskCode: string;
    summaries: ChecklistSummary[];
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
        },
        category->{_id, title} // Fetch category information
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

export async function getGroupedChecklistSummaries(options?: {
  userId?: string;
  search?: string;
}): Promise<GroupedChecklistSummary[]> {
  try {
    const { userId, search = '' } = options || {};

    let query = `*[_type == "checklistSummary"`;
    const params: { userId?: string; search?: string } = {};

    if (userId) {
      query += ` && user._ref == $userId`;
      params.userId = userId;
    }
    if (search) {
      query += ` && taskCode match $search`;
      params.search = `*${search}*`;
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
        category->{_id, title} // Fetch category information
      },
      items[]{
        _key,
        itemId,
        status,
        note
      }
    } | order(updatedAt desc)`;

    const rawSummaries: (ChecklistSummary & { checklist: { category: { _id: string; title: string } | null } })[] = await client.fetch(query, params);

    const grouped: { [categoryId: string]: GroupedChecklistSummary } = {};

    rawSummaries.forEach(summary => {
      const categoryId = summary.checklist?.category?._id || 'uncategorized';
      const categoryTitle = summary.checklist?.category?.title || 'Uncategorized';
      const taskCode = summary.taskCode || 'no-task-code';

      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          categoryId,
          categoryTitle,
          taskCodeGroups: []
        };
      }

      let taskCodeGroup = grouped[categoryId].taskCodeGroups.find(
        group => group.taskCode === taskCode
      );

      if (!taskCodeGroup) {
        taskCodeGroup = { taskCode, summaries: [] };
        grouped[categoryId].taskCodeGroups.push(taskCodeGroup);
        // Sort taskCodeGroups so that task codes within a category are consistent (e.g., by taskCode string)
        grouped[categoryId].taskCodeGroups.sort((a, b) => a.taskCode.localeCompare(b.taskCode));
      }
      taskCodeGroup.summaries.push(summary);
    });

    // Convert the grouped object back to an array and sort categories by title
    const result = Object.values(grouped).sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle));

    // Sort summaries within each taskCodeGroup by updatedAt desc
    result.forEach(categoryGroup => {
      categoryGroup.taskCodeGroups.forEach(taskGroup => {
        taskGroup.summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    });

    return result;

  } catch (error) {
    console.error('Error fetching grouped checklist summaries:', error);
    throw new Error('Failed to fetch grouped checklist summaries');
  }
}
