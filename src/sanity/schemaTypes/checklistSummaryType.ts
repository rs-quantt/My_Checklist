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
      name: 'taskCode',
      title: 'Task Code',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'totalItems',
      title: 'Total Items',
      type: 'number',
      readOnly: true, // Calculated based on checklist items
    }),
    defineField({
      name: 'passedItems',
      title: 'Passed Items',
      type: 'number',
      readOnly: true, // Calculated based on userChecklistItems status
    }),
  ],
});
