import { client } from '@/sanity/lib/client';

export const clearUserChecklistItems = async (): Promise<void> => {
  try {
    // This query deletes all documents of type 'userChecklistItem'

    /* Table  */
    // checklistSummary
    // userChecklistItem

    await client.delete({
      query: `*[_type in ["checklistSummary", "userChecklistItem"]]`,
    });
  } catch (error) {
    console.error('Failed to delete user checklist item data:', error);
    throw new Error('Failed to delete user checklist item data');
  }
};
