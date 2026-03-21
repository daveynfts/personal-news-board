import { defineField, defineType } from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Article (Editorial)',
  type: 'document',
  groups: [
    { name: 'general', title: 'Nội dung chính' },
    { name: 'media', title: 'Hình ảnh' },
    { name: 'flags', title: 'Phân loại & Trạng thái' },
    { name: 'seo', title: 'SEO & Social' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'general', validation: Rule => Rule.required() }),
    defineField({ 
      name: 'slug', 
      title: 'Slug (URL)', 
      type: 'slug', 
      group: 'general',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
      description: 'Đường dẫn URL của bài viết (Bấm Generate để tạo tự động).'
    }),
    defineField({ name: 'category', title: 'Category', type: 'string', group: 'general' }),
    defineField({ name: 'authorName', title: 'Author Name', type: 'string', group: 'general' }),
    defineField({ 
      name: 'daveysTake', 
      title: 'Davey\'s Take (Góc nhìn của bạn)', 
      type: 'text',
      rows: 5,
      group: 'general',
      description: '👉 RẤT QUAN TRỌNG CHO SEO: Viết suy nghĩ, phân tích, hay tóm tắt của riêng bạn để tạo "Unique Value". Google ưu tiên bài tổng hợp có góc nhìn cá nhân.'
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'general',
      of: [
        { type: 'block' },
        { 
          type: 'image', 
          options: { hotspot: true },
          fields: [
            { name: 'caption', type: 'string', title: 'Caption (Mô tả ảnh)' },
            { name: 'attribution', type: 'string', title: 'Attribution (Nguồn ảnh)' },
            { name: 'attributionUrl', type: 'url', title: 'Attribution URL (Link nguồn)' }
          ]
        },
        { 
          type: 'object',
          name: 'twitter',
          title: 'Twitter Embed (Kèm Context SEO)',
          fields: [
            { name: 'url', type: 'url', title: 'Tweet URL', validation: Rule => Rule.required() },
            { name: 'contextTop', type: 'text', title: 'Caption / Nguồn (Nằm giữa, dưới Tweet)', rows: 2, description: 'Ví dụ: "CEO Vinh The Nguyen chia sẻ từ bài đăng X"' },
            { name: 'contextBottom', type: 'text', title: 'Lời bình luận (Nằm dưới cùng, in nghiêng)', rows: 3, description: 'Ví dụ: "Góc nhìn của chúng tôi là..."' }
          ]
        },
        {
          type: 'object',
          name: 'pullQuote',
          title: 'Trích Dẫn (Pull Quote)',
          fields: [
            { name: 'quote', type: 'text', title: 'Câu Phát Biểu', rows: 4, validation: Rule => Rule.required() },
            { name: 'author', type: 'string', title: 'Người Phát Biểu', validation: Rule => Rule.required() },
            { name: 'roleOrSource', type: 'string', title: 'Chức vụ / Nguồn' },
            { name: 'sourceUrl', type: 'url', title: 'Link Nguồn (Nếu có)' }
          ]
        }
      ]
    }),
    defineField({ 
      name: 'coverImage', 
      title: 'Cover Image (Banner 16:9)', 
      type: 'image', 
      group: 'media', 
      options: { hotspot: true },
      description: '💡 Tỉ lệ khuyến nghị: 16:9 (chính xác 1200x675px). Dùng làm ảnh bìa chính của bài viết.'
    }),
    defineField({ 
      name: 'squareThumbnail', 
      title: 'Square Thumbnail (Ảnh vuông 1:1)', 
      type: 'image', 
      group: 'media', 
      options: { hotspot: true },
      description: '💡 KHUYÊN DÙNG: Upload ảnh tỉ lệ 1:1 (ví dụ 400x400) để hiển thị hoàn hảo ở mục "Tin Tức Mới Nhất" dạng cuộn dọc ngang, ghép không bị cắt chữ.'
    }),
    
    defineField({ name: 'isEditorialPick', title: 'Editor\'s Choice', type: 'boolean', initialValue: false, group: 'flags' }),
    defineField({ name: 'isHotStory', title: 'Hot Story', type: 'boolean', initialValue: false, group: 'flags' }),
    defineField({ name: 'isMore', title: 'Add to More (Archive)', type: 'boolean', initialValue: false, group: 'flags', description: 'Bật cờ này để đưa bài viết vào kho lưu trữ (Archive).' }),
    defineField({ name: 'xSourceUrl', title: 'X (Twitter) Source URL', type: 'url', group: 'flags' }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', initialValue: () => new Date().toISOString(), group: 'flags' }),
    
    // TAB SEO
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      group: 'seo',
      description: 'Cấu hình tiêu đề, mô tả và ảnh Thumbnail khi chia sẻ link lên mạng xã hội.',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', description: 'Nên dài từ 50-60 ký tự.' }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 3, description: 'Nên dài từ 150-160 ký tự.' }),
        defineField({ name: 'focusKeyword', title: 'Focus Keyword', type: 'string' }),
        defineField({ name: 'openGraphImage', title: 'Open Graph Image', type: 'image', description: '💡 Tỉ lệ BẮT BUỘC: 1200x630px. Đây là ảnh sẽ hiển thị khi link được chia sẻ trên Facebook, Twitter/X, Telegram.' }),
        
        // Trích nguồn (SEO Curation)
        defineField({ 
          name: 'originalSourceName', 
          title: 'Tên Nguồn Gốc', 
          type: 'string', 
          description: 'Ví dụ: CoinDesk, Vitalik Blog... (Sẽ hiển thị thành Nút "Đọc bài gốc tại CoinDesk")' 
        }),
        defineField({ 
          name: 'originalSourceUrl', 
          title: 'Link Bài Gốc (Original URL)', 
          type: 'url',
          description: 'BẮT BUỘC nếu là bài lấy từ nguồn khác. Website sẽ tự động đặt thẻ rel="canonical" để tránh Google phạt án Duplicate Content.' 
        }),
        
        // Advanced SEO Fields
        defineField({ 
          name: 'isIndexable', 
          title: 'Lập chỉ mục (Index / No-Index)', 
          type: 'boolean', 
          initialValue: true,
          description: 'Bật (Mặc định): Cho phép Google lập chỉ mục. Tắt: Chèn thẻ <meta name="robots" content="noindex"> để ẩn khỏi kết quả tìm kiếm Google.'
        }),
        defineField({ 
          name: 'canonicalUrl', 
          title: 'Canonical URL (Đường dẫn gốc)', 
          type: 'url',
          description: 'Khai báo đường dẫn gốc để tránh bị Google phạt lỗi trùng lặp nội dung (Duplicate Content) do dán link Affiliate hoặc chạy Ads có chứa tham số theo dõi (?ref=...).' 
        }),
      ]
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'publishedAt' },
  },
})
