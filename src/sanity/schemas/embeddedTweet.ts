import { defineField, defineType } from 'sanity'
import { TweetIcon } from '../components/TweetIcon'
import React from 'react'

export const embeddedTweetType = defineType({
  name: 'embeddedTweet',
  title: 'X Pick (Tweet Wall)',
  type: 'document',
  fields: [
    defineField({ name: 'tweetId', title: 'Tweet ID', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'label', title: 'Label', type: 'string', description: 'Nên nhập để phân biệt bài viết trong danh sách Studio. Ví dụ: "Dự đoán giá BTC"' }),
    defineField({ name: 'category', title: 'Category', type: 'string', initialValue: 'general' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isVisible', title: 'Visible', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { 
      tweetId: 'tweetId',
      label: 'label'
    },
    prepare(selection: Record<string, any>) {
      const { tweetId, label } = selection;
      return {
        // Fallback title prevents Sanity from displaying "Untitled"
        title: label || (tweetId ? `Tweet: ${tweetId}` : 'Chưa có Label'),
        subtitle: tweetId ? 'X Pick' : 'Chưa nhập Tweet ID',
        // Inject a React component that handles async fetching for the image
        media: React.createElement(TweetIcon, { tweetId })
      }
    }
  }
})
