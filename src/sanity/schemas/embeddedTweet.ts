import { defineField, defineType } from 'sanity'

export const embeddedTweetType = defineType({
  name: 'embeddedTweet',
  title: 'X Pick (Tweet Wall)',
  type: 'document',
  fields: [
    defineField({ name: 'tweetId', title: 'Tweet ID', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'category', title: 'Category', type: 'string', initialValue: 'general' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isVisible', title: 'Visible', type: 'boolean', initialValue: true }),
    defineField({ 
      name: 'previewImage', 
      title: 'Ảnh Preview (Studio)', 
      type: 'image', 
      description: 'Upload nhanh ảnh chụp Tweet để dễ nhận diện bài nào cũ/mới trong danh sách.' 
    }),
  ],
  preview: {
    select: { 
      title: 'label', 
      subtitle: 'tweetId',
      media: 'previewImage'
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Chưa nhập Label',
        subtitle: subtitle ? `Tweet ID: ${subtitle}` : 'Trống',
        media: media
      }
    }
  },
})
