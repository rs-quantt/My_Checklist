import { client } from '@/sanity/lib/client';
import { Checklist, ChecklistItem } from '@/types/checklist';

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
    const updatedChecklist = await client
      .patch(id)
      .set(updates)
      .commit();

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

/**
 * This function remains correct as its logic for counting items does not depend on their order.
 */
export async function saveUserChecklistItems(
  userId: string,
  checklistId: string,
  taskCode: string,
  items: Array<{ itemId: string; status: string; note?: string }>
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
        console.warn(`Skipping item due to missing data: ${JSON.stringify(item)}`);
        continue;
      }

      const docId = `${userId}-${itemId}-${taskCode}`;
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
      { userId, checklistId, taskCode }
    );

    const passedItems = await client.fetch(
      `count(*[_type == "userChecklistItem"
          && user._ref == $userId
          && taskCode == $taskCode
          && status == "done"
          && item._ref in *[_type == "checklist" && _id == $checklistId].items[]._ref])`,
      { userId, checklistId, taskCode }
    );

    const summaryDocId = `${userId}-${checklistId}-${taskCode}-summary`;
    const existingSummary = await client.fetch(
      `*[_type == "checklistSummary" && _id == $summaryDocId][0]`,
      { summaryDocId }
    );

    const summaryTransaction = client.transaction();
    const summaryData = {
      totalItems,
      passedItems,
      updatedAt: new Date().toISOString(),
      taskCode,
    };

    if (existingSummary) {
      summaryTransaction.patch(summaryDocId, { set: summaryData });
    } else {
      summaryTransaction.create({
        _id: summaryDocId,
        _type: 'checklistSummary',
        user: { _type: 'reference', _ref: userId },
        checklist: { _type: 'reference', _ref: checklistId },
        ...summaryData,
      });
    }

    await summaryTransaction.commit();

    return;
  } catch (error) {
    console.error('Error saving user checklist items:', error);
    throw new Error('Failed to save user checklist items.');
  }
}

export async function getChecklistSummaryById(id: string) {
  try {
    const summary = await client.fetch(`*[_type == "checklistSummary" && _id == $id][0]`, { id });

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
        "userId": user->_id,
        "templateId": checklist->_id,
        user->{_id, name},
        checklist->{
          _id,
          title,
          "items": items[]->{
            _id,
            "title": label,
            "status": coalesce(
              *[
                _type == "userChecklistItem" &&
                user._ref == $userRef &&
                item._ref == ^._id &&
                taskCode == $taskCode
              ][0].status,
              "incomplete"
            ),
            "note": *[
              _type == "userChecklistItem" &&
              user._ref == $userRef &&
              item._ref == ^._id &&
              taskCode == $taskCode
            ][0].note
          }
        }
      }`,
      { id, userRef, taskCode }
    );

    if (!userChecklist) {
      console.warn(`No checklist summary found for ID: ${id}`);
      return null;
    }

    if (userChecklist.checklist?.items) {
      userChecklist.checklist.items = userChecklist.checklist.items.map(
        (item: ChecklistItem & { status: string }) => ({
          ...item,
          isCompleted: item.status === "done",
        })
      );
    }

    return userChecklist;
  } catch (error) {
    console.error(`Error fetching user checklist with summary id ${id}:`, error);
    throw new Error(`Failed to fetch user checklist with summary id ${id}.`);
  }
}
