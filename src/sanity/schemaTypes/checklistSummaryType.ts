import { ActivityIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const checklistSummaryType = defineType({
  name: 'checklistSummary',
  title: 'Checklist Summary',
  type: 'document',
  icon: ActivityIcon,
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'checklist',
      title: 'Checklist',
      type: 'reference',
      to: [{ type: 'checklist' }],
    }),
    defineField({
      name: 'totalItems',
      title: 'Total Items',
      type: 'number',
    }),
    defineField({
      name: 'passedItems',
      title: 'Passed Items (Oke)',
      type: 'number',
    }),
  ],
});