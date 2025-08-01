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
      name: 'type',
      title: 'Checklist Type',
      type: 'string',
      options: {
        list: [
          { title: 'Onboarding', value: 'onboarding' },
          { title: 'Training', value: 'training' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
    },
  },
})
