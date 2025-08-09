import { createClient, SanityClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '@/sanity/env.server';

interface ChecklistDocument {
  _id: string;
  items?: { _ref: string }[];
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

export async function transferChecklistItems(sourceId: string, destinationIds: string[]): Promise<void> {
  if (!sourceId || !destinationIds || destinationIds.length === 0) {
    throw new Error('Source and destination checklists are required.');
  }

  const sourceChecklist = await client.getDocument<ChecklistDocument>(sourceId);
  if (!sourceChecklist || !sourceChecklist.items) {
    throw new Error('Source checklist not found or has no items.');
  }

  const sourceItemRefs = sourceChecklist.items.map(item => item._ref);

  const destinationChecklists: ChecklistDocument[] = await client.fetch(`*[_id in $ids]`, { ids: destinationIds });

  const transaction = client.transaction();

  destinationChecklists.forEach(dest => {
    if (dest) {
      const existingItemRefs = dest.items?.map(item => item._ref) || [];
      const combinedItems = [...new Set([...existingItemRefs, ...sourceItemRefs])];
      
      transaction.patch(dest._id, {
        set: {
          items: combinedItems.map(_ref => ({ _type: 'reference', _ref })),
        },
      });
    }
  });

  await transaction.commit();
}
