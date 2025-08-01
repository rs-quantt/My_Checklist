import { CheckmarkCircleIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const checklistItemType = defineType({
  name: 'checklistItem',
  title: 'Checklist Item',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'checklist',
      title: 'Checklist',
      type: 'reference',
      to: [{ type: 'checklist' }],
    }),
    defineField({
      name: 'label',
      title: 'Item Label',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'order',
      title: 'Order (for sorting)',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'checklist.title',
    },
  },
});
