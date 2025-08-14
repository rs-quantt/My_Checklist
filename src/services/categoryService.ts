import { client } from '@/sanity/lib/client';
import { Category } from '@/types/category';

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await client.fetch(`
      *[_type == "category"]{
        _id,
        title,
        description
      } | order(title asc)
    `);
    return categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories.');
  }
}

interface UserCategorySummary {
  _id: string;
  title: string;
  totalChecklists: number;
  completedChecklists: number;
  completionPercentage: number;
  taskCode?: string;
}

interface RawCategorySummary {
  _id: string;
  category: {
    _id: string;
    title: string;
  };
  totalItems: number;
  passedItems: number;
  taskCode?: string;
}

export async function getMyCategorySummaries(
  userId: string,
): Promise<UserCategorySummary[]> {
  try {
    if (!userId) {
      console.error(
        'getMyCategorySummaries: userId is undefined or empty. Cannot fetch summaries.',
      );
      return [];
    }

    const query = `
      *[_type == "categorySummary" && defined(user) && user._ref == $userId]{
        _id,
        category->{_id, title},
        totalItems,
        passedItems,
        taskCode
      } | order(category->title asc)
    `;

    const params = { userId };

    const summaries = await client.fetch(query, params);

    if (summaries.length === 0) {
      return [];
    }

    const processedSummaries = summaries
      .map((summary: RawCategorySummary) => {
        if (
          !summary.category ||
          !summary.category._id ||
          !summary.category.title
        ) {
          console.error(
            'Invalid category summary found: Missing category details for summary:',
            summary,
          );
          return null;
        }
        const totalChecklists = summary.totalItems || 0;
        const completedChecklists = summary.passedItems || 0;

        const processedItem = {
          _id: summary._id,
          title: summary.category.title,
          totalChecklists: totalChecklists,
          completedChecklists: completedChecklists,
          completionPercentage:
            totalChecklists > 0
              ? (completedChecklists / totalChecklists) * 100
              : 0,
          taskCode: summary.taskCode,
        };

        return processedItem;
      })
      .filter(Boolean);

    if (processedSummaries.length === 0 && summaries.length > 0) {
      console.warn(
        'All fetched category summaries were filtered out due to missing/invalid category details.',
      );
    }

    return processedSummaries;
  } catch (error) {
    console.error('Error fetching my category summaries:', error);
    throw new Error('Failed to fetch user category summaries.');
  }
}

interface CategorySummaryChecklistItem {
  _id: string;
  title: string;
  passedItems: number; // Corrected field name
  totalItems: number; // Corrected field name
}

export interface MyCategorySummaryDetail {
  _id: string;
  title: string;
  description?: string;
  slug: {
    current: string;
  };
  items: CategorySummaryChecklistItem[];
  checklistsCompletedCount: number;
  totalChecklistsCount: number;
}

export async function getMyCategorySummaryDetailById(
  id: string,
): Promise<MyCategorySummaryDetail | null> {
  try {
    const query = `
      *[_type == "categorySummary" && _id == $id][0]{
        _id,
        category->{
          _id,
          title,
          description,
          "slug": slug.current
        },
        "items": items[]->{ // Dereference each item in the array
          _id,
          "title": checklist->title, // Get title from the referenced checklist in checklistSummary
          passedItems,
          totalItems,
        },
        "checklistsCompletedCount": passedItems,
        "totalChecklistsCount": totalItems,
      }
    `;

    const params = { id };
    const result = await client.fetch(query, params);

    if (!result || !result.category) {
      return null;
    }

    // Transform the result to match the MyCategorySummaryDetail interface
    const transformedResult: MyCategorySummaryDetail = {
      _id: result._id,
      title: result.category.title,
      description: result.category.description,
      slug: { current: result.category.slug },
      items: result.items.map((item: CategorySummaryChecklistItem) => ({
        _id: item._id,
        title: item.title,
        passedItems: item.passedItems, // Corrected field name
        totalItems: item.totalItems, // Corrected field name
      })),
      checklistsCompletedCount: result.checklistsCompletedCount,
      totalChecklistsCount: result.totalChecklistsCount,
    };

    return transformedResult;
  } catch (error) {
    console.error('Error fetching my category summary detail by ID:', error);
    throw new Error('Failed to fetch category summary detail.');
  }
}
