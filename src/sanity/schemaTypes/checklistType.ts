import { defineField, defineType } from "sanity";
import { ComposeIcon } from "@sanity/icons";

export const checklistType = defineType({
  name: 'checklist',
  title: 'Checklist',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Checklist Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of the checklist.',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: ['Coding Rule', 'Test Case', 'Experience'],
        layout: 'radio'
      },
      initialValue: 'Coding Rule'
    }),
    defineField({
      name: 'items',
      title: 'Checklist Items',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'checklistItem' }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title,
      };
    },
  },
});
