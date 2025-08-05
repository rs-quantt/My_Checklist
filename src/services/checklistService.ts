import { client } from '@/sanity/lib/client';
import { Checklist } from '@/types/checklist';

export async function getChecklists(): Promise<Checklist[]> {
  try {
    const checklists = await client.fetch(`
      *[_type == "checklist"]{
        _id,
        title,
        description,
        "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){
          _id,
          label,
          description,
          order
        }
      }
    `);
    return checklists;
  } catch (error) {
    console.error('Error fetching checklists:', error);
    throw new Error('Failed to fetch checklists.');
  }
}

export async function getChecklistById(id: string): Promise<Checklist | null> {
  try {
    const checklist = await client.fetch(
      `
            *[_type == "checklist" && _id == $id][0]{
              _id,
              title,
              description,
              "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){
                _id,
                label,
                description,
                order
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

export async function countChecklists(): Promise<number> {
  try {
    const count = await client.fetch('count(*[_type == "checklist"])');
    return count;
  } catch (error) {
    console.error('Error counting checklists:', error);
    throw new Error('Failed to count checklists.');
  }
}

export async function saveUserChecklistItems(
  userId: string,
  taskCode: string,
  items: Array<{ itemId: string; status: string; note?: string }>
) {
  try {
    let checklistId: string | null = null;
    const transaction = client.transaction();

    for (const item of items) {
      const { itemId, status, note } = item;
      if (!itemId || !status) continue;

      // Fetch checklist ID once
      if (!checklistId) {
        const itemDetails = await client.fetch(
          `*[_type == "checklistItem" && _id == $itemId][0]{ checklist->{_id} }`,
          { itemId }
        );
        checklistId = itemDetails?.checklist?._id ?? null;
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

    const result = await transaction.commit();

    if (checklistId) {
      // Đếm tổng số item và số item pass
      const totalItems = await client.fetch(
        `count(*[_type == "userChecklistItem" 
          && user._ref == $userId 
          && item->checklist._ref == $checklistId 
          && taskCode == $taskCode])`,
        { userId, checklistId, taskCode }
      );

      const passedItems = await client.fetch(
        `count(*[_type == "userChecklistItem" 
          && user._ref == $userId 
          && item->checklist._ref == $checklistId 
          && status == "OK" 
          && taskCode == $taskCode])`,
        { userId, checklistId, taskCode }
      );

      const summaryDocId = `${userId}-${checklistId}-summary`;
      const summaryTransaction = client.transaction();

      const existingSummary = await client.fetch(
        `*[_id == $summaryDocId][0]`,
        { summaryDocId }
      );

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
    }

    return result;
  } catch (error) {
    console.error('Error saving user checklist items:', error);
    throw new Error('Failed to save user checklist items.');
  }
}

