import { client } from '@/sanity/lib/client';
import { Checklist, ChecklistItem, UserChecklistItem } from '@/types/checklist';

// Updated to fetch 'type' and 'itemCount'
export async function getChecklists(): Promise<Checklist[]> {
  try {
    const checklists = await client.fetch(`
      *[_type == "checklist"]{
        _id,
        title,
        description,
        type,
        isCommon,
        "itemCount": count(items)
      } | order(_createdAt desc)
    `);
    return checklists || [];
  } catch (error) {
    console.error('Error fetching checklists:', error);
    throw new Error('Failed to fetch checklists.');
  }
}

// Updated to sort items by the new numeric priority value and fetch type
export async function getChecklistById(id: string): Promise<Checklist | null> {
  try {
    const checklist = await client.fetch(
      `
        *[_type == "checklist" && _id == $id][0]{
          _id,
          title,
          description,
          type,
          category->{_id, title}, // Fetch category reference
          "items": items[]-> | order(priority asc) {
            _id,
            label,
            description,
            priority
          }
        }
      `,
      { id },
    );
    return checklist;
  } catch (error) {
    console.error(`Error fetching checklist with id ${id}:`, error);
    throw new Error(`Failed to fetch checklist with id ${id}.`);
  }
}

export async function getChecklistsByCategoryId(
  categoryId: string,
): Promise<Checklist[]> {
  try {
    const categoryWithChecklists = await client.fetch(
      `
      *[_type == "category" && _id == $categoryId][0]{
        "checklists": checklists[]->{
          _id,
          title,
          description,
          type,
          "items": items[]-> | order(priority asc) {
            _id,
            label,
            description,
            priority
          }
        }
      }
      `,
      { categoryId },
    );

    // Return the checklists array from the fetched category, or an empty array if not found
    return categoryWithChecklists?.checklists || [];
  } catch (error) {
    console.error(
      `Error fetching checklists for category ${categoryId}:`,
      error,
    );
    throw new Error(`Failed to fetch checklists for category ${categoryId}.`);
  }
}

// No changes needed for createChecklist
export async function createChecklist(
  checklist: Omit<Checklist, '_id' | 'items'>,
): Promise<Checklist> {
  try {
    const newChecklist = await client.create({
      _type: 'checklist',
      ...checklist,
      items: [],
    });
    return newChecklist;
  } catch (error) {
    console.error('Error creating checklist:', error);
    throw new Error('Failed to create checklist.');
  }
}

// No changes needed for updateChecklist
export async function updateChecklist(
  id: string,
  updates: Partial<Omit<Checklist, '_id' | 'items'>>,
): Promise<Checklist> {
  try {
    const updatedChecklist = await client.patch(id).set(updates).commit();

    return updatedChecklist as unknown as Checklist;
  } catch (error) {
    console.error(`Error updating checklist with id ${id}:`, error);
    throw new Error(`Failed to update checklist with id ${id}.`);
  }
}

// No changes needed for countChecklists
export async function countChecklists(): Promise<number> {
  try {
    const count = await client.fetch('count(*[_type == "checklist"])');
    return count || 0;
  } catch (error) {
    console.error('Error counting checklists:', error);
    throw new Error('Failed to count checklists.');
  }
}

interface CategoryChecklistSummary {
  _id: string;
  totalItems: number;
  passedItems: number;
}

/**
 * This function remains correct as its logic for counting items does not depend on their order.
 */
export async function saveUserChecklistItems(
  userId: string,
  checklistId: string,
  taskCode: string,
  commitMessage: string,
  items: Array<{ itemId: string; status: string; note?: string }>,
  categoryId: string, // categoryId is now directly passed in
) {
  try {
    if (!checklistId) {
      throw new Error('Checklist ID is required to save user checklist items.');
    }

    const transaction = client.transaction();

    // Step 1: Update or create userChecklistItem documents
    for (const item of items) {
      const { itemId, status, note } = item;
      if (!itemId || !status) {
        console.warn(
          `Skipping item due to missing data: ${JSON.stringify(item)}`,
        );
        continue;
      }

      const docId = `${userId}-${itemId}-${taskCode.toLowerCase()}`;
      const existingDoc = await client.fetch(`*[_id == $docId][0]`, { docId });

      if (existingDoc) {
        transaction.patch(docId, {
          set: {
            status,
            note: note || '',
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        transaction.create({
          _id: docId,
          _type: 'userChecklistItem',
          user: { _type: 'reference', _ref: userId },
          item: { _type: 'reference', _ref: itemId },
          status,
          note: note || '',
          taskCode,
          updatedAt: new Date().toISOString(),
          checklist: { _type: 'reference', _ref: checklistId }, // Add checklist reference here
        });
      }
    }

    await transaction.commit();

    // Step 2: Create or update checklistSummary
    const totalItems = await client.fetch(
      `count(*[_type == "userChecklistItem"
          && user._ref == $userId
          && taskCode == $taskCode
          && item._ref in *[_type == "checklist" && _id == $checklistId].items[]._ref])`,
      { userId, checklistId, taskCode },
    );

    const passedItems = await client.fetch(
      `count(*[_type == "userChecklistItem"
          && user._ref == $userId
          && taskCode == $taskCode
          && status == "done"
          && item._ref in *[_type == "checklist" && _id == $checklistId].items[]._ref])`,
      { userId, checklistId, taskCode },
    );

    const summaryDocId = `${userId}-${checklistId}-${taskCode.toLowerCase()}-summary`;
    const existingSummary = await client.fetch(
      `*[_type == "checklistSummary" && _id == $summaryDocId][0]`,
      { summaryDocId },
    );

    const summaryTransaction = client.transaction();
    const summaryData = {
      user: { _type: 'reference', _ref: userId },
      checklist: { _type: 'reference', _ref: checklistId },
      totalItems,
      passedItems,
      updatedAt: new Date().toISOString(),
      taskCode,
      commitMessage,
    };

    if (existingSummary) {
      summaryTransaction.patch(summaryDocId, { set: summaryData });
    } else {
      summaryTransaction.create({
        _id: summaryDocId,
        _type: 'checklistSummary',
        ...summaryData,
      });
    }

    await summaryTransaction.commit();

    // Step 3: Create or update categorySummary

    if (categoryId) {
      // First, get all checklist IDs that belong to this category
      const checklistsInThisCategory = await client.fetch(
        `*[_type == "category" && _id == $categoryId][0]{
          "checklistIds": checklists[]._ref
        }`,
        { categoryId },
      );

      const relatedChecklistIds = checklistsInThisCategory?.checklistIds || [];

      // Find all checklistSummaries for this user, taskCode, and related checklist IDs
      const categoryChecklistSummaries = await client.fetch(
        `*[_type == "checklistSummary"
            && user._ref == $userId
            && taskCode == $taskCode
            && checklist._ref in $relatedChecklistIds]{
          _id,
          totalItems,
          passedItems
        }`,
        { userId, taskCode, relatedChecklistIds }, // Pass relatedChecklistIds here
      );

      let totalCategoryItems = 0;
      let passedCategoryItems = 0;
      const categorySummaryItems: Array<{
        _ref: string;
        _type: string;
        _key: string;
      }> = [];

      categoryChecklistSummaries.forEach(
        (summary: CategoryChecklistSummary) => {
          totalCategoryItems += summary.totalItems;
          passedCategoryItems += summary.passedItems;
          // CHANGE HERE: Specify the actual document type for the reference
          categorySummaryItems.push({
            _key: summary._id, // Add a unique key for each item in the array
            _ref: summary._id,
            _type: 'checklistSummary',
          });
        },
      );

      const categorySummaryDocId = `${userId}-${categoryId}-${taskCode.toLowerCase()}-category-summary`;
      const existingCategorySummary = await client.fetch(
        `*[_type == "categorySummary" && _id == $categorySummaryDocId][0]`,
        { categorySummaryDocId },
      );

      const categorySummaryTransaction = client.transaction();
      const categorySummaryData = {
        user: { _type: 'reference', _ref: userId },
        category: { _type: 'reference', _ref: categoryId },
        totalItems: totalCategoryItems,
        passedItems: passedCategoryItems,
        items: categorySummaryItems, // Array of references to checklistSummary documents
        updatedAt: new Date().toISOString(),
        taskCode,
        commitMessage,
      };

      if (existingCategorySummary) {
        categorySummaryTransaction.patch(categorySummaryDocId, {
          set: categorySummaryData,
        });
      } else {
        categorySummaryTransaction.create({
          _id: categorySummaryDocId,
          _type: 'categorySummary',
          ...categorySummaryData,
        });
      }

      await categorySummaryTransaction.commit();
    } else {
      console.warn(
        `categoryId is not provided. Skipping category summary update.`,
      );
    }

    return summaryDocId;
  } catch (error) {
    console.error('Error saving user checklist items:', error);
    throw new Error('Failed to save user checklist items.');
  }
}

export async function getChecklistSummaryById(id: string) {
  try {
    const summary = await client.fetch(
      `*[_type == "checklistSummary" && _id == $id][0]`,
      { id },
    );

    if (!summary) {
      console.warn(`No checklist summary found for ID: ${id}`);
      return null;
    }

    const userRef = summary.user?._ref;
    const taskCode = summary.taskCode;

    if (!userRef || !taskCode) {
      console.error('User reference or task code is missing in the summary');
      return null;
    }

    const userChecklist = await client.fetch(
      `*[_type == "checklistSummary" && _id == $id][0]{
        _id,
        taskCode,
        commitMessage,
        "userId": user->_id,
        "templateId": checklist->_id,
        user->{_id, name},
        checklist->{
          _id,
          title,
          "items": items[]->{
            _id,
            "title": label,
            description, // ADDED description here
            "status": coalesce(
              *[_type == "userChecklistItem" &&
                user._ref == $userRef &&
                item._ref == ^._id &&
                taskCode == $taskCode
              ][0].status,
              "incomplete"
            ),
            "note": *[_type == "userChecklistItem" &&
              user._ref == $userRef &&
              item._ref == ^._id &&
              taskCode == $taskCode
            ][0].note
          }
        }
      }`,
      { id, userRef, taskCode },
    );

    if (!userChecklist) {
      console.warn(`No checklist summary found for ID: ${id}`);
      return null;
    }

    if (userChecklist.checklist?.items) {
      userChecklist.checklist.items = userChecklist.checklist.items.map(
        (item: ChecklistItem & { status: string }) => ({
          ...item,
          isCompleted: item.status === 'done',
        }),
      );
    }

    return userChecklist;
  } catch (error) {
    console.error(
      `Error fetching user checklist with summary id ${id}:`,
      error,
    );
    throw new Error(`Failed to fetch user checklist with summary id ${id}.`);
  }
}

// New function to fetch UserChecklistItem by taskCode and userId
export async function getUserChecklistItemsByTaskCodeAndUserId(
  userId: string,
  taskCode: string,
): Promise<UserChecklistItem[]> {
  try {
    const query = `
      *[_type == "userChecklistItem" && user._ref == $userId && taskCode == $taskCode]{
        "_id": _id,
        "itemId": item._ref,
        status,
        note,
        // Dynamically find the checklistId by looking at which checklist contains this item
        "checklistId": *[_type == "checklist" && references(^.item._ref)][0]._id
      }
    `;

    const params = { userId, taskCode };
    const userChecklistItems = await client.fetch(query, params);
    return userChecklistItems;
  } catch (error) {
    console.error(
      `Error fetching user checklist items for user ${userId} and task code ${taskCode}:`,
      error,
    );
    throw new Error(
      `Failed to fetch user checklist items for user ${userId} and task code ${taskCode}.`,
    );
  }
}
