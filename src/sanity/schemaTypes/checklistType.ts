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
    // Đã xóa định nghĩa trường 'type'
    // defineField({
    //   name: 'type',
    //   title: 'Checklist Type',
    //   type: 'string',
    //   options: {
    //     list: [
    //       { title: 'Onboarding', value: 'onboarding' },
    //       { title: 'Training', value: 'training' },
    //     ],
    //   },
    // }),
  ],
  preview: {
    select: {
      title: 'title',
      // Đã xóa subtitle 'type' khỏi preview select
      // subtitle: 'type',
    },
    prepare({ title }) { // Cập nhật prepare để chỉ nhận title
      return {
        title,
        // Không còn subtitle 'type'
        // subtitle: subtitle ? `Type: ${subtitle}` : '',
      };
    },
  },
});
