import { defineField, defineType } from 'sanity'
import { TweetPreview } from '../components/TweetPreview'

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
  ],
  preview: {
    select: { 
      tweetId: 'tweetId',
      label: 'label'
    }
  },
  components: {
    preview: TweetPreview as any
  }
})
