import { CheckmarkCircleIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const checklistItemType = defineType({
  name: 'checklistItem',
  title: 'Checklist Item',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Item Label',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [{ name: 'href', type: 'url' }],
              },
            ],
          },
        },
        {
          type: 'code',
          options: {
            highlightedLines: true,
          },
        },
        // Add image type to the array
        {
          type: 'image',
          options: {
            hotspot: true, // Allows for better image cropping
          },
          // No custom fields
          fields: [],
        },
      ],
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'High', value: '1' },
          { title: 'Medium', value: '2' },
          { title: 'Low', value: '3' },
        ],
        layout: 'radio', // or 'dropdown'
      },
      initialValue: 'Low',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'priority',
    },
     prepare({ title, subtitle }) {
      return {
        title: title,
        subtitle: `Priority: ${subtitle || 'Not set'}`,
      };
    },
  },
});
