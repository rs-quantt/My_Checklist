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
      name: 'checked',
      title: 'Checked',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'checkedAt',
      title: 'Checked At',
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
