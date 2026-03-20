import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Curation Feed (Links)',
  type: 'document',
  groups: [
    { name: 'general', title: 'Nội dung' },
    { name: 'media', title: 'Hình ảnh' },
    { name: 'status', title: 'Trạng thái' }
  ],
  fields: [
    defineField({ name: 'type', title: 'Post Type', type: 'string', initialValue: 'Research', options: { list: ['Research', 'Article'] }, group: 'general' }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required(), group: 'general' }),
    defineField({ name: 'url', title: 'Source URL', type: 'url', validation: Rule => Rule.required(), group: 'general' }),
    defineField({ 
      name: 'imageUrl', 
      title: 'Image', 
      type: 'image', 
      group: 'media',
      options: { hotspot: true },
      description: '💡 Tỉ lệ khuyến nghị: 16:9 (VD: 1200x675) hoặc Vuông 1:1 (tùy thuộc vào Post Type).'
    }),
    defineField({ name: 'isMore', title: 'Load More Content (Archive)', type: 'boolean', initialValue: false, group: 'status' }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', initialValue: () => new Date().toISOString(), group: 'status' }),
  ],
  preview: {
    select: { title: 'title', media: 'imageUrl', subtitle: 'type' },
  },
})
