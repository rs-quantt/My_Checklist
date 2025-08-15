import { ActivityIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const categorySummaryType = defineType({
  name: 'categorySummary',
  title: 'Category Summary',
  icon: ActivityIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'taskCode',
      title: 'Task Code',
      type: 'string',
    }),
    defineField({
      name: 'commitMessage',
      title: 'Commit Message',
      type: 'string',
    }),
    defineField({
      name: 'totalItems',
      title: 'Total Items',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'passedItems',
      title: 'Passed Items',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{ type: 'checklistSummary' }], // Reference to checklistSummaryType
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      // Removed dateFormat option to let Sanity handle it automatically
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      userName: 'user.name',
      categoryTitle: 'category.title',
      total: 'totalItems',
      passed: 'passedItems',
    },
    prepare: ({ userName, categoryTitle, total, passed }) => {
      const percentage = total > 0 ? (passed / total) * 100 : 0;
      return {
        title: `${categoryTitle} summary by ${userName}`,
        subtitle: `${passed}/${total} (${percentage.toFixed(2)}%) items passed`,
      };
    },
  },
});