import { defineField, defineType } from 'sanity'

export const cryptoEventType = defineType({
  name: 'cryptoEvent',
  title: 'Airdrop Radar Event',
  type: 'document',
  groups: [
    { name: 'general', title: 'Thông tin Dự án' },
    { name: 'rewards', title: 'Phần thưởng & Khóa' },
    { name: 'status', title: 'Trạng thái & Link' },
  ],
  fields: [
    defineField({ name: 'platform', title: 'Platform', type: 'string', validation: Rule => Rule.required(), group: 'general' }),
    defineField({ name: 'platformIcon', title: 'Platform Icon', type: 'string', initialValue: '🟡', group: 'general', description: 'Biểu tượng nền tảng (Emoji hoặc text).' }),
    defineField({ name: 'platformColor', title: 'Platform Color', type: 'string', initialValue: '#f0b90b', group: 'general' }),
    defineField({ name: 'eventType', title: 'Event Type', type: 'string', initialValue: 'Launchpool', group: 'general' }),
    defineField({ name: 'tokenSymbol', title: 'Token Symbol', type: 'string', validation: Rule => Rule.required(), group: 'general' }),
    defineField({ name: 'tokenName', title: 'Token Name', type: 'string', group: 'general' }),
    defineField({ name: 'description', title: 'Description', type: 'text', group: 'general' }),
    
    defineField({ name: 'totalRewards', title: 'Total Rewards', type: 'string', group: 'rewards' }),
    defineField({ name: 'stakingAssets', title: 'Staking Assets (List)', type: 'array', of: [{ type: 'string' }], group: 'rewards' }),
    defineField({ name: 'apr', title: 'APR', type: 'string', group: 'rewards' }),
    
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['live', 'upcoming', 'ended'] }, initialValue: 'upcoming', group: 'status' }),
    defineField({ name: 'endDate', title: 'End Date / Time', type: 'datetime', group: 'status' }),
    defineField({ name: 'tags', title: 'Tags (List)', type: 'array', of: [{ type: 'string' }], group: 'status' }),
    defineField({ name: 'ctaLink', title: 'Action Link (CTA)', type: 'url', group: 'status' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0, group: 'status' }),
    defineField({ name: 'isVisible', title: 'Visible', type: 'boolean', initialValue: true, group: 'status' }),
  ],
  preview: {
    select: { title: 'tokenSymbol', subtitle: 'platform' },
  },
})
