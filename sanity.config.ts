import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { projectId, dataset } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  
  title: 'Personal News Board Studio',

  schema: {
    types: schemaTypes,
  },
  
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Nội dung')
          .items([
            S.listItem()
              .title('Cấu hình chung')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) => !['siteSettings'].includes(listItem.getId() as string)
            )
          ])
    }),
  ],
})
