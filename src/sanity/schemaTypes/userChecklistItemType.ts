import { defineType, defineField } from 'sanity';
import { ExpandIcon } from '@sanity/icons';

export const userChecklistItemType = defineType({
  name: 'userChecklistItem',
  title: 'User Checklist Item',
  type: 'document',
  icon: ExpandIcon,
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
    }),
    defineField({
      name: 'item',
      title: 'Checklist Item',
      type: 'reference',
      to: [{ type: 'checklistItem' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'OK', value: 'OK' },
          { title: 'Not OK', value: 'notOK' },
          { title: 'N/A', value: 'na' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'note',
      title: 'Reason / Note',
      type: 'text',
      hidden: ({ parent }) => parent?.status === 'OK',
    }),
    defineField({
      name: 'taskCode',
      title: 'Task Code',
      type: 'string',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'item.label',
      subtitle: 'user.name',
    },
  },
});
