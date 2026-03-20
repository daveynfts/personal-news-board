import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Calendar Event',
  type: 'document',
  groups: [
    { name: 'general', title: 'Thông tin Sự kiện' },
    { name: 'media', title: 'Hình ảnh' },
    { name: 'status', title: 'Trạng thái' }
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required(), group: 'general' }),
    defineField({ name: 'description', title: 'Description', type: 'text', group: 'general' }),
    defineField({ name: 'date', title: 'Date', type: 'datetime', validation: Rule => Rule.required(), group: 'general' }),
    defineField({ name: 'location', title: 'Location', type: 'string', group: 'general' }),
    defineField({ name: 'link', title: 'Link', type: 'url', group: 'general' }),
    
    defineField({ 
      name: 'imageUrl', 
      title: 'Main Image (Cover)', 
      type: 'image', 
      group: 'media',
      options: { hotspot: true },
      description: '💡 Tỉ lệ khuyến nghị: 16:9 (1200x675px). Dùng làm ảnh Cover lớn cho sự kiện.'
    }),
    defineField({ 
      name: 'timelineImageUrl', 
      title: 'Timeline Thumbnail', 
      type: 'image', 
      group: 'media',
      options: { hotspot: true },
      description: '💡 Tỉ lệ khuyến nghị: 4:3 hoặc Vuông 1:1 (nhỏ gọn). Dùng để hiển thị trong Timeline sự kiện.'
    }),
    
    defineField({ name: 'isMore', title: 'Load More Content (Archive)', type: 'boolean', initialValue: false, group: 'status' }),
  ],
  preview: {
    select: { title: 'title', media: 'imageUrl', subtitle: 'date' },
  },
})
