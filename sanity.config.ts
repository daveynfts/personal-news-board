import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { projectId, dataset } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  
  title: 'DaveyNFTs Studio',

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
              (listItem) => !['siteSettings', 'embeddedTweet'].includes(listItem.getId() as string)
            ),
            S.divider(),
            S.listItem()
              .title('X Picks (Quản lý)')
              .child(
                S.list()
                  .title('Quản lý Tweet Wall')
                  .items([
                    S.listItem()
                      .title('🟢 Đang Hiển Thị (Trang chủ)')
                      .child(
                        S.documentList()
                          .title('Active Tweets')
                          .schemaType('embeddedTweet')
                          .filter('_type == "embeddedTweet" && isVisible == true')
                      ),
                    S.listItem()
                      .title('🔴 Đã Ẩn (Kho lưu trữ)')
                      .child(
                        S.documentList()
                          .title('Hidden Tweets')
                          .schemaType('embeddedTweet')
                          .filter('_type == "embeddedTweet" && isVisible != true')
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Tất cả X Picks')
                      .child(S.documentTypeList('embeddedTweet'))
                  ])
              )
          ])
    }),
  ],
})
