import {defineField, defineType} from 'sanity'

export const ruleType = defineType({
  name: 'rule',
  title: 'Rule',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'color',
                title: 'Color',
                type: 'object',
                fields: [
                  {
                    name: 'color',
                    type: 'string',
                    title: 'Color',
                    options: {
                      list: [
                        {title: 'Red', value: '#ef4444'},
                        {title: 'Green', value: '#22c55e'},
                        {title: 'Blue', value: '#3b82f6'},
                        {title: 'Yellow', value: '#eab308'},
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
        },
        {
          type: 'code',
        },
        {
          type: 'table',
        },
      ],
    }),
  ],
})
