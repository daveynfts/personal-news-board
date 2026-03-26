import { defineField, defineType } from 'sanity'

export const footerSettingsType = defineType({
  name: 'footerSettings',
  title: 'Footer Settings',
  type: 'document',
  groups: [
    { name: 'brand', title: 'Thương Hiệu' },
    { name: 'links', title: 'Liên Kết' },
    { name: 'legal', title: 'Pháp Lý' },
  ],
  fields: [
    // Brand
    defineField({
      name: 'brandDescription',
      title: 'Mô tả thương hiệu',
      type: 'text',
      rows: 2,
      group: 'brand',
      description: 'Dòng mô tả ngắn hiển thị dưới logo ở footer.',
    }),
    defineField({
      name: 'socialXUrl',
      title: 'Link X (Twitter)',
      type: 'url',
      group: 'brand',
      initialValue: 'https://x.com/DaveyNFTs_',
    }),

    // Navigation Links
    defineField({
      name: 'navLinks',
      title: 'Link điều hướng',
      type: 'array',
      group: 'links',
      description: 'Danh sách link hiển thụ ở cột "Khám Phá". Để trống sẽ dùng mặc định.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Nhãn', type: 'string', validation: Rule => Rule.required() }),
          defineField({ name: 'href', title: 'Đường dẫn', type: 'string', validation: Rule => Rule.required(), description: 'VD: /news, /articles, /events' }),
        ],
        preview: {
          select: { title: 'label', subtitle: 'href' },
        },
      }],
    }),

    defineField({
      name: 'resourceLinks',
      title: 'Link tài nguyên',
      type: 'array',
      group: 'links',
      description: 'Danh sách link ở cột "Tài Nguyên". Để trống sẽ dùng mặc định.',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Nhãn', type: 'string', validation: Rule => Rule.required() }),
          defineField({ name: 'href', title: 'Đường dẫn / URL', type: 'string', validation: Rule => Rule.required() }),
          defineField({ name: 'isExternal', title: 'Mở tab mới?', type: 'boolean', initialValue: false }),
          defineField({ name: 'hasSparkle', title: 'Biểu tượng sao ✨?', type: 'boolean', initialValue: false }),
        ],
        preview: {
          select: { title: 'label', subtitle: 'href' },
        },
      }],
    }),

    // Legal
    defineField({
      name: 'disclaimerTitle',
      title: 'Tiêu đề Disclaimer',
      type: 'string',
      group: 'legal',
      initialValue: 'Tuyên bố miễn trừ trách nhiệm',
      description: 'Tiêu đề phần tuyên bố pháp lý.',
    }),
    defineField({
      name: 'disclaimerText',
      title: 'Nội dung Disclaimer',
      type: 'text',
      rows: 6,
      group: 'legal',
      description: 'Nội dung đầy đủ phần tuyên bố miễn trừ trách nhiệm pháp lý. Đây là phần quan trọng để tuân thủ quy định.',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Bản quyền',
      type: 'string',
      group: 'legal',
      description: 'VD: "DaveyNFTs. Bảo lưu mọi quyền." (Năm sẽ tự thêm)',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Footer Settings' };
    },
  },
})
