import { client } from '@/sanity/lib/client';
import { Checklist } from '@/types/checklist';
// Assuming you have a types file for Checklist

// Define types if you don't have a separate types file
// type ChecklistItem = {
//   _id: string;
//   label: string;
//   description?: string;
//   order?: number;
// };

// type Checklist = {
//   _id: string;
//   title: string;
//   description?: string;
//   items: ChecklistItem[];
// };

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
    // Placeholder: Implement actual Sanity create logic here
    // This is a simplified example, you'll likely need to handle items separately
    const newChecklist = await client.create({
      _type: 'checklist',
      ...checklist,
      // Items would likely be created separately or in a more complex transaction
      items: [], // Assuming items are added after checklist creation
    });
    return newChecklist;
  } catch (error) {
    console.error('Error creating checklist:', error); // Log original error
    throw new Error('Failed to create checklist.'); // Throw a generic error
  }
}

export async function updateChecklist(
  id: string,
  updates: Partial<Omit<Checklist, '_id' | 'items'>>,
): Promise<Checklist> {
  try {
    // Placeholder: Implement actual Sanity update logic here
    // This is a simplified example
    const updatedChecklist = await client
      .patch(id) // Document ID to patch
      .set(updates) // Set attributes to update
      .commit(); // Commit the patch

    // You might need to fetch the full updated checklist with items
    // return getChecklistById(id);

    return updatedChecklist as unknown as Checklist; // Or handle fetching the full checklist
  } catch (error) {
    console.error(`Error updating checklist with id ${id}:`, error); // Log original error
    throw new Error(`Failed to update checklist with id ${id}.`); // Throw a generic error
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
  items: Array<{ itemId: string; status: string; note?: string }>,
) {
  // Consider refining the return type
  try {
    let checklistId = null; // Still needed for summary update logic
    const transaction = client.transaction();

    for (const item of items) {
      const { itemId, status, note } = item;

      // Basic validation - Sanity transaction will also validate schema
      if (!itemId || !status) {
        console.warn(
          `Skipping item due to missing data: ${JSON.stringify(item)}`,
        );
        continue;
      }

      // Fetch checklistId for the first item to use for summary update
      if (!checklistId) {
        const itemDetails = await client.fetch(
          `*[_type == "checklistItem" && _id == $itemId][0]{ checklist->{_id} }`,
          { itemId },
        );
        if (itemDetails?.checklist?._id) {
          checklistId = itemDetails.checklist._id;
        } else {
          console.error(
            `Could not find checklist ID for item ${itemId}. Skipping checklist summary update.`,
          );
        }
      }

      const docId = `${userId}-${itemId}-${taskCode}`;

      // Check if the userChecklistItem document already exists
      const existingDoc = await client.fetch(`*[_id == $docId][0]`, { docId });

      if (existingDoc) {
        // If it exists, patch the existing document
        transaction.patch(docId, {
          set: {
            status,
            note: note || '',
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        // If it doesn't exist, create a new document
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

    // --- Start: Logic to update Checklist Summary ---
    // Note: This logic is placed *before* the userChecklistItem transaction commit.
    // This means the summary is calculated based on existing data + planned updates in the transaction.
    // If you need the summary calculation to reflect *only* committed userChecklistItem data,
    // move this entire block *after* `await transaction.commit();`

    // Ensure we have a checklistId before attempting to update summary
    if (checklistId) {
      // Get total items for the checklist
      const checklistDetails = await client.fetch(
        `*[_type == "checklist" && _id == $checklistId][0]{ "totalItems": count(items) }`,
        { checklistId },
      );
      const totalItems = checklistDetails?.totalItems || 0;

      // Get all of the user's checklist items for this checklist to count passed items
      const userPassedItems = await client.fetch(
        `count(*[_type == "userChecklistItem" && user._ref == $userId && checklistItem->checklist._ref == $checklistId && status == "OK"])`,
        { userId, checklistId },
      );

      const resultText = `${userPassedItems}/${totalItems}`;
      const summaryDocId = `${userId}-${checklistId}-summary`;

      // Find or create the checklist summary document
      const summaryTransaction = client.transaction();

      // Check if the summary document already exists
      const existingSummaryDoc = await client.fetch(
        `*[_id == $summaryDocId][0]`,
        { summaryDocId },
      );

      if (existingSummaryDoc) {
        summaryTransaction.patch(summaryDocId, {
          set: {
            totalItems: totalItems,
            passedItems: userPassedItems,
            resultText: resultText,
            updatedAt: new Date().toISOString(),
            taskCode: taskCode, // Added taskCode
          },
        });
      } else {
        summaryTransaction.create({
          _id: summaryDocId,
          _type: 'checklistSummary',
          user: { _type: 'reference', _ref: userId },
          checklist: { _type: 'reference', _ref: checklistId },
          totalItems: totalItems,
          passedItems: userPassedItems,
          resultText: resultText,
          updatedAt: new Date().toISOString(),
          taskCode: taskCode, // Added taskCode
        });
      }

      await summaryTransaction.commit();
    } else {
      console.warn(
        'Checklist ID not determined, skipping checklist summary update.',
      );
    }

    // --- End: Logic to update Checklist Summary ---

    const result = await transaction.commit();
    return result;
  } catch (error) {
    console.error('Error saving user checklist items:', error);
    throw new Error('Failed to save user checklist items.');
  }
}
