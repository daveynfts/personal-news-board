import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string' }),
    defineField({ name: 'siteDescription', title: 'Site Description', type: 'text' }),
    defineField({ name: 'email', title: 'Contact Email', type: 'string' }),
    defineField({ name: 'socialX', title: 'X (Twitter) URL', type: 'url' }),
    defineField({ 
      name: 'avatar', 
      title: 'Avatar Logo', 
      type: 'image', 
      options: { hotspot: true },
      description: 'Ảnh đại diện được gắn trên thanh điều hướng.'
    }),
    defineField({ 
      name: 'bubbleText', 
      title: 'Hiệu ứng bong bóng (Bubble Text)', 
      type: 'text',
      description: 'Văn bản hiển thị khi trỏ chuột vào Logo. Có thể bấm Enter để xuống dòng và chèn Emoji tự do (Cửa sổ chat Emoji: Windows + . hoặc Ctrl + Cmd + Space).'
    }),
  ]
})
