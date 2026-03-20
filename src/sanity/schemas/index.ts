import { type SchemaTypeDefinition } from 'sanity'

import { articleType } from './article'
import { postType } from './post'
import { eventType } from './event'
import { exchangeType } from './exchange'
import { cryptoEventType } from './cryptoEvent'
import { embeddedTweetType } from './embeddedTweet'
import { siteSettingsType } from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  articleType,
  postType,
  eventType,
  exchangeType,
  cryptoEventType,
  embeddedTweetType,
  siteSettingsType
]
