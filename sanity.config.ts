import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { projectId, dataset } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemas'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createManagedList = (S: any, typeTitle: string, typeName: string, activeFilter: string, hiddenFilter: string) => {
  return S.listItem()
    .title(`${typeTitle} (Quản lý)`)
    .child(
      S.list()
        .title(`Quản lý ${typeTitle}`)
        .items([
          S.listItem()
            .title('🟢 Đang Hiển Thị (Trang chủ)')
            .child(
              S.documentList()
                .title('Active')
                .schemaType(typeName)
                .filter(`_type == "${typeName}" && ${activeFilter}`)
            ),
          S.listItem()
            .title('🔴 Đã Ẩn / Kho lưu trữ')
            .child(
              S.documentList()
                .title('Hidden / Archived')
                .schemaType(typeName)
                .filter(`_type == "${typeName}" && ${hiddenFilter}`)
            ),
          S.divider(),
          S.listItem()
            .title(`Tất cả ${typeTitle}`)
            .child(S.documentTypeList(typeName))
        ])
    )
};

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
      structure: (S) => {
        // Danh sách các schema đã được custom thư mục
        const managedTypes = ['siteSettings', 'embeddedTweet', 'article', 'cryptoEvent', 'exchange', 'post', 'event'];

        return S.list()
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
            
            createManagedList(S, 'Bài Viết (Article)', 'article', '(!defined(isMore) || isMore == false)', 'isMore == true'),
            createManagedList(S, 'X Picks (Tweet)', 'embeddedTweet', '(!defined(isVisible) || isVisible == true)', 'isVisible == false'),
            createManagedList(S, 'Bài Đăng (Post)', 'post', '(!defined(isMore) || isMore == false)', 'isMore == true'),
            createManagedList(S, 'Sự Kiện Lớn (Event)', 'event', '(!defined(isMore) || isMore == false)', 'isMore == true'),
            createManagedList(S, 'Sự Kiện Crypto', 'cryptoEvent', '(!defined(isVisible) || isVisible == true)', 'isVisible == false'),
            createManagedList(S, 'Sàn Giao Dịch', 'exchange', '(!defined(isVisible) || isVisible == true)', 'isVisible == false'),

            // Render các schema còn lại (nếu có thêm sau này)
            ...S.documentTypeListItems().filter(
              (listItem) => !managedTypes.includes(listItem.getId() as string)
            )
          ]);
      }
    }),
  ],
})
