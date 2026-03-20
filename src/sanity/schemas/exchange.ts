import { defineField, defineType } from 'sanity'

export const exchangeType = defineType({
  name: 'exchange',
  title: 'Special Offer (Exchange)',
  type: 'document',
  groups: [
    { name: 'details', title: 'Chi tiết Offer' },
    { name: 'styles', title: 'Giao diện & Link' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required(), group: 'details' }),
    defineField({ name: 'badge', title: 'Badge Text', type: 'string', group: 'details' }),
    defineField({ name: 'bonus', title: 'Bonus Details', type: 'string', group: 'details', description: 'Ví dụ: "Lên tới 20% phí giao dịch"' }),
    defineField({ name: 'features', title: 'Features (List)', type: 'array', of: [{ type: 'string' }], group: 'details' }),
    
    defineField({ name: 'badgeColor', title: 'Badge Color (Hex)', type: 'string', initialValue: '#f0b90b', group: 'styles' }),
    defineField({ name: 'gradient', title: 'Gradient CSS', type: 'string', group: 'styles' }),
    defineField({ name: 'glowColor', title: 'Glow Color (Hex)', type: 'string', group: 'styles' }),
    defineField({ name: 'logo', title: 'Logo (Emoji/URL)', type: 'string', initialValue: '🟡', group: 'styles', description: 'Ảnh đại diện. Khuyến nghị ảnh vuông (1:1), kích thước nhỏ.' }),
    defineField({ name: 'link', title: 'Ref Link', type: 'url', group: 'styles' }),
    
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0, group: 'details' }),
    defineField({ name: 'isVisible', title: 'Visible', type: 'boolean', initialValue: true, group: 'details' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'bonus' },
  },
})
