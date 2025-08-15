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

// Existing interface for individual user's category summary
interface UserCategorySummary {
  _id: string;
  title: string;
  totalChecklists: number;
  completedChecklists: number;
  completionPercentage: number;
  taskCode?: string;
}

// Raw data structure fetched from Sanity for category summaries
interface RawCategorySummary {
  _id: string;
  category: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    name: string;
  };
  totalItems: number;
  passedItems: number;
  taskCode?: string;
}

// New interface for individual category summary item in Admin List Page
export interface AdminCategoryListItem {
  _id: string;
  title: string; // Category Title
  userName: string;
  taskCode?: string;
  totalChecklists: number;
  completedChecklists: number;
  completionPercentage: number;
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

// Renamed from getAllCategorySummaries and modified to return individual summaries for admin list
export async function getAllIndividualCategorySummaries(): Promise<AdminCategoryListItem[]> {
  try {
    const query = `
      *[_type == "categorySummary"]{
        _id,
        category->{_id, title},
        user->{_id, name},
        totalItems,
        passedItems,
        taskCode
      } | order(category->title asc, user->name asc, taskCode asc)
    `;

    const rawSummaries: RawCategorySummary[] = await client.fetch(query);

    const processedSummaries = rawSummaries
      .map((summary) => {
        if (
          !summary.category ||
          !summary.category._id ||
          !summary.category.title ||
          !summary.user ||
          !summary.user.name
        ) {
          console.warn(
            'Skipping category summary due to missing category/user details:',
            summary,
          );
          return null;
        }
        const totalChecklists = summary.totalItems || 0;
        const completedChecklists = summary.passedItems || 0;

        return {
          _id: summary._id,
          title: summary.category.title,
          userName: summary.user.name,
          taskCode: summary.taskCode,
          totalChecklists: totalChecklists,
          completedChecklists: completedChecklists,
          completionPercentage:
            totalChecklists > 0
              ? (completedChecklists / totalChecklists) * 100
              : 0,
        };
      })
      .filter(Boolean) as AdminCategoryListItem[];

    return processedSummaries;
  } catch (error) {
    console.error('Error fetching all individual category summaries:', error);
    throw new Error('Failed to fetch all individual category summaries.');
  }
}

// These interfaces and function are no longer needed for the current admin category summary feature
// as the requirement is to display individual category summaries, not aggregated ones.
// Re-evaluate if an aggregated view is needed elsewhere in the admin panel.
/*
export interface AdminCategoryChecklistSummary {
  _id: string; // Checklist _id
  title: string; // Checklist title
  totalInstances: number; // Total times this checklist appeared in any categorySummary for this category
  completedInstances: number; // Total times this checklist was marked as passed in any categorySummary for this category
  completionPercentage: number;
}

export interface AdminCategoryDetail {
  _id: string; // Category _id
  title: string;
  description?: string;
  slug: { current: string };
  checklists: AdminCategoryChecklistSummary[]; // Aggregated summaries for each checklist within this category
  overallTotalChecklists: number; // Sum of totalItems from all categorySummaries in this category
  overallCompletedChecklists: number; // Sum of passedItems from all categorySummaries in this category
  overallCompletionPercentage: number;
}

export async function getAdminCategoryDetail(categoryId: string): Promise<AdminCategoryDetail | null> {
  try {
    // Implementation for aggregated category detail
  } catch (error) {
    console.error(`Error fetching admin category detail for ID ${categoryId}:`, error);
    throw new Error(`Failed to fetch admin category detail for ID ${categoryId}.`);
  }
}
*/

interface CategorySummaryChecklistItem {
  _id: string;
  title: string;
  passedItems: number;
  totalItems: number;
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
