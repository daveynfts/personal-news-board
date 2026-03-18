export type Locale = 'en' | 'vi';

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // ── Header / Nav ──────────────────────────────────────────────────────
    'nav.specialOffer': 'SPECIAL OFFER',
    'nav.home': 'HOME',
    'nav.admin': 'ADMIN',
    'search.placeholder': 'Search posts, articles, events...',
    'search.noResults': 'No results for',
    'search.tryDifferent': 'Try different keywords',
    'search.results': 'result',
    'search.resultsPlural': 'results',
    'search.navigate': 'navigate',
    'search.open': 'open',
    'search.close': 'close',
    'search.found': 'found',
    'search.everything': 'Search everything...',
    'search.articles': 'Search articles...',
    'search.events': 'Search events...',
    'search.picks': 'Search picks...',
    'search.clearLabel': 'Clear search',

    // ── Hero ──────────────────────────────────────────────────────────────
    'hero.title': 'Your Curated Universe.',
    'hero.subtitle': 'A personal collection of top news, insightful blogs, and interesting X threads, built for elite curation.',
    'hero.noEvents': 'A personal collection of top news, insightful blogs, and interesting X threads. No upcoming events scheduled.',

    // ── Section Titles ────────────────────────────────────────────────────
    'section.editorialPicks': 'Editorial Picks',
    'section.latestFeatures': 'Latest Features',
    'section.daveyPicks': "DaveyNFTs' Picks",
    'section.eventsTimeline': 'Events & Timeline',
    'section.featuredPosts': 'Featured Posts',
    'section.timeline': 'Timeline',

    // ── Buttons & Actions ─────────────────────────────────────────────────
    'btn.viewAllArticles': 'View All Articles →',
    'btn.viewAllPicks': 'View All Picks →',
    'btn.viewAllEvents': 'View All Events →',
    'btn.readArticle': 'Read Article',
    'btn.accessSource': 'ACCESS SOURCE',
    'btn.registerNow': 'Register Now',
    'btn.rsvp': 'RSVP ↗',
    'btn.viewRecap': 'View Recap ↗',
    'btn.registerNowArrow': 'Register Now ↗',
    'btn.backToHome': '← Back to Home',
    'btn.backToFeed': 'Back to Feed',
    'btn.backToAllPicks': '← Back to All Picks',
    'btn.goToAdmin': 'Go to Admin',

    // ── Carousel ──────────────────────────────────────────────────────────
    'carousel.featuredArticle': '★ Featured Article',
    'carousel.source': 'Source',

    // ── Events ────────────────────────────────────────────────────────────
    'events.featuredEvent': 'FEATURED EVENT',
    'events.upcoming': 'Upcoming',
    'events.past': 'Past',
    'events.going': 'Going',
    'events.ended': 'Ended',
    'events.noDescription': 'No description provided.',
    'events.online': 'Online',
    'events.onlineLink': 'Online / Link provided',
    'events.byDavey': 'By DaveyNFTs',
    'events.noUpcoming': 'No upcoming events found.',
    'events.noPast': 'No past events found.',

    // ── Filter ────────────────────────────────────────────────────────────
    'filter.all': 'All',
    'filter.news': 'News',
    'filter.blog': 'Blog',
    'filter.x': 'X',

    // ── Post Card ─────────────────────────────────────────────────────────
    'post.syncing': 'Syncing...',

    // ── Tweet Wall ────────────────────────────────────────────────────────
    'tweet.curatedInsights': 'Curated insights from the crypto community',
    'tweet.all': '🌐 All',
    'tweet.general': '📌 General',
    'tweet.breaking': '🔥 Breaking',
    'tweet.analysis': '📊 Analysis',
    'tweet.alpha': '💎 Alpha',
    'tweet.thread': '🧵 Thread',

    // ── Archive Pages ─────────────────────────────────────────────────────
    'archive.fullArchive': '✍️ Full Archive',
    'archive.editorialAndFeatures': 'Editorial & Features',
    'archive.articlesSubtitle': 'In-depth articles, editorial picks, and long-form reads on crypto and web3.',
    'archive.editorialPicksStat': 'Editorial Picks',
    'archive.features': 'Features',
    'archive.archived': 'Archived',
    'archive.noArticles': 'No articles yet',
    'archive.articlesAdminHint': 'Articles added through the admin panel will appear here.',
    'archive.starEditorialPicks': '★ Editorial Picks',
    'archive.readArticle': 'Read Article →',
    'archive.xSource': '𝕏 Source',
    'archive.extendedArchive': 'Extended Archive',

    // Events Archive
    'archive.eventsLabel': '📅 Full Archive',
    'archive.eventsTitle': 'Events & Timeline',
    'archive.eventsSubtitle': 'All conferences, meetups, and web3 events — upcoming and past.',
    'archive.upcomingStat': 'Upcoming',
    'archive.pastStat': 'Past',
    'archive.noEvents': 'No events yet',
    'archive.eventsAdminHint': 'Events added through the admin panel will appear here.',
    'archive.upcomingEvents': 'Upcoming Events',
    'archive.pastEvents': 'Past Events',

    // Picks Archive
    'archive.picksLabel': '📌 Full Feed',
    'archive.picksTitle': "DaveyNFTs' Picks",
    'archive.picksSubtitle': 'Every curated news, blog post, and X thread — the complete collection.',
    'archive.activePicksStat': 'Active Picks',
    'archive.xThread': '𝕏 Thread',
    'archive.noPicks': 'No picks yet',
    'archive.picksAdminHint': 'Posts added through the admin panel will appear here.',
    'archive.allPicks': 'All Picks',
    'archive.xThreadPicks': '𝕏 Thread Picks',
    'archive.noPosts': 'No {filter} posts',
    'archive.tryFilter': 'Try a different filter or add posts from the admin panel.',
    'archive.newsLabel': '📰 News',
    'archive.blogLabel': '✍️ Blog',
    'archive.xLabel': '𝕏 X Thread',

    // ── Article Detail ────────────────────────────────────────────────────
    'article.editorialPick': '★ Editorial Pick',
    'article.featureArticle': 'Feature Article',
    'article.viewOnX': 'View on X',
    'article.xSourceTitle': 'X Source',

    // ── Empty States ──────────────────────────────────────────────────────
    'empty.noPosts': 'No posts found for this category.',
    'empty.addMagic': 'Add some magic in the admin panel!',

    // ── Search Bar Component ──────────────────────────────────────────────
    'searchbar.posts': 'Posts',
    'searchbar.articles': 'Articles',
    'searchbar.events': 'Events',
    'searchbar.noResultsFor': 'No results for',
    'searchbar.tryDifferent': 'Try different keywords or check your spelling',

    // ── Language Toggle ───────────────────────────────────────────────────
    'lang.en': 'EN',
    'lang.vi': 'VI',
  },

  vi: {
    // ── Header / Nav ──────────────────────────────────────────────────────
    'nav.specialOffer': 'ƯU ĐÃI ĐẶC BIỆT',
    'nav.home': 'TRANG CHỦ',
    'nav.admin': 'QUẢN TRỊ',
    'search.placeholder': 'Tìm bài viết, bài báo, sự kiện...',
    'search.noResults': 'Không tìm thấy kết quả cho',
    'search.tryDifferent': 'Hãy thử từ khóa khác',
    'search.results': 'kết quả',
    'search.resultsPlural': 'kết quả',
    'search.navigate': 'di chuyển',
    'search.open': 'mở',
    'search.close': 'đóng',
    'search.found': 'tìm thấy',
    'search.everything': 'Tìm kiếm...',
    'search.articles': 'Tìm bài báo...',
    'search.events': 'Tìm sự kiện...',
    'search.picks': 'Tìm picks...',
    'search.clearLabel': 'Xóa tìm kiếm',

    // ── Hero ──────────────────────────────────────────────────────────────
    'hero.title': 'Vũ Trụ Được Tuyển Chọn.',
    'hero.subtitle': 'Bộ sưu tập cá nhân gồm tin tức hàng đầu, blog chuyên sâu và các thread X thú vị, được xây dựng cho sự tuyển chọn tinh hoa.',
    'hero.noEvents': 'Bộ sưu tập cá nhân gồm tin tức hàng đầu, blog chuyên sâu và các thread X thú vị. Chưa có sự kiện sắp tới.',

    // ── Section Titles ────────────────────────────────────────────────────
    'section.editorialPicks': 'Bài Biên Tập Chọn Lọc',
    'section.latestFeatures': 'Bài Viết Nổi Bật',
    'section.daveyPicks': 'DaveyNFTs Chọn Lọc',
    'section.eventsTimeline': 'Sự Kiện & Dòng Thời Gian',
    'section.featuredPosts': 'Bài Đăng Nổi Bật',
    'section.timeline': 'Dòng Thời Gian',

    // ── Buttons & Actions ─────────────────────────────────────────────────
    'btn.viewAllArticles': 'Xem Tất Cả Bài Viết →',
    'btn.viewAllPicks': 'Xem Tất Cả Picks →',
    'btn.viewAllEvents': 'Xem Tất Cả Sự Kiện →',
    'btn.readArticle': 'Đọc Bài Viết',
    'btn.accessSource': 'XEM NGUỒN',
    'btn.registerNow': 'Đăng Ký Ngay',
    'btn.rsvp': 'ĐĂNG KÝ ↗',
    'btn.viewRecap': 'Xem Tóm Tắt ↗',
    'btn.registerNowArrow': 'Đăng Ký Ngay ↗',
    'btn.backToHome': '← Về Trang Chủ',
    'btn.backToFeed': 'Về Bảng Tin',
    'btn.backToAllPicks': '← Về Tất Cả Picks',
    'btn.goToAdmin': 'Vào Quản Trị',

    // ── Carousel ──────────────────────────────────────────────────────────
    'carousel.featuredArticle': '★ Bài Viết Tiêu Điểm',
    'carousel.source': 'Nguồn',

    // ── Events ────────────────────────────────────────────────────────────
    'events.featuredEvent': 'SỰ KIỆN NỔI BẬT',
    'events.upcoming': 'Sắp Tới',
    'events.past': 'Đã Qua',
    'events.going': 'Sẽ Tham Gia',
    'events.ended': 'Đã Kết Thúc',
    'events.noDescription': 'Chưa có mô tả.',
    'events.online': 'Trực Tuyến',
    'events.onlineLink': 'Trực tuyến / Có liên kết',
    'events.byDavey': 'Bởi DaveyNFTs',
    'events.noUpcoming': 'Không có sự kiện sắp tới.',
    'events.noPast': 'Không có sự kiện đã qua.',

    // ── Filter ────────────────────────────────────────────────────────────
    'filter.all': 'Tất Cả',
    'filter.news': 'Tin Tức',
    'filter.blog': 'Blog',
    'filter.x': 'X',

    // ── Post Card ─────────────────────────────────────────────────────────
    'post.syncing': 'Đang đồng bộ...',

    // ── Tweet Wall ────────────────────────────────────────────────────────
    'tweet.curatedInsights': 'Thông tin chọn lọc từ cộng đồng crypto',
    'tweet.all': '🌐 Tất Cả',
    'tweet.general': '📌 Chung',
    'tweet.breaking': '🔥 Nóng',
    'tweet.analysis': '📊 Phân Tích',
    'tweet.alpha': '💎 Alpha',
    'tweet.thread': '🧵 Thread',

    // ── Archive Pages ─────────────────────────────────────────────────────
    'archive.fullArchive': '✍️ Kho Lưu Trữ',
    'archive.editorialAndFeatures': 'Biên Tập & Bài Nổi Bật',
    'archive.articlesSubtitle': 'Bài viết chuyên sâu, tuyển chọn biên tập và các bài đọc dài về crypto và web3.',
    'archive.editorialPicksStat': 'Biên Tập Chọn',
    'archive.features': 'Nổi Bật',
    'archive.archived': 'Đã Lưu Trữ',
    'archive.noArticles': 'Chưa có bài viết',
    'archive.articlesAdminHint': 'Bài viết được thêm qua trang quản trị sẽ xuất hiện ở đây.',
    'archive.starEditorialPicks': '★ Biên Tập Chọn Lọc',
    'archive.readArticle': 'Đọc Bài Viết →',
    'archive.xSource': '𝕏 Nguồn',
    'archive.extendedArchive': 'Kho Lưu Trữ Mở Rộng',

    // Events Archive
    'archive.eventsLabel': '📅 Kho Lưu Trữ',
    'archive.eventsTitle': 'Sự Kiện & Dòng Thời Gian',
    'archive.eventsSubtitle': 'Tất cả hội nghị, gặp mặt và sự kiện web3 — sắp tới và đã qua.',
    'archive.upcomingStat': 'Sắp Tới',
    'archive.pastStat': 'Đã Qua',
    'archive.noEvents': 'Chưa có sự kiện',
    'archive.eventsAdminHint': 'Sự kiện được thêm qua trang quản trị sẽ xuất hiện ở đây.',
    'archive.upcomingEvents': 'Sự Kiện Sắp Tới',
    'archive.pastEvents': 'Sự Kiện Đã Qua',

    // Picks Archive
    'archive.picksLabel': '📌 Bảng Tin Đầy Đủ',
    'archive.picksTitle': 'DaveyNFTs Chọn Lọc',
    'archive.picksSubtitle': 'Mọi tin tức, bài blog và thread X được tuyển chọn — bộ sưu tập đầy đủ.',
    'archive.activePicksStat': 'Đang Hoạt Động',
    'archive.xThread': '𝕏 Thread',
    'archive.noPicks': 'Chưa có picks',
    'archive.picksAdminHint': 'Bài đăng được thêm qua trang quản trị sẽ xuất hiện ở đây.',
    'archive.allPicks': 'Tất Cả Picks',
    'archive.xThreadPicks': '𝕏 Thread Picks',
    'archive.noPosts': 'Không có bài {filter}',
    'archive.tryFilter': 'Thử bộ lọc khác hoặc thêm bài đăng từ trang quản trị.',
    'archive.newsLabel': '📰 Tin Tức',
    'archive.blogLabel': '✍️ Blog',
    'archive.xLabel': '𝕏 X Thread',

    // ── Article Detail ────────────────────────────────────────────────────
    'article.editorialPick': '★ Biên Tập Chọn Lọc',
    'article.featureArticle': 'Bài Viết Tiêu Điểm',
    'article.viewOnX': 'Xem trên X',
    'article.xSourceTitle': 'Nguồn X',

    // ── Empty States ──────────────────────────────────────────────────────
    'empty.noPosts': 'Không tìm thấy bài viết cho danh mục này.',
    'empty.addMagic': 'Thêm nội dung trong trang quản trị!',

    // ── Search Bar Component ──────────────────────────────────────────────
    'searchbar.posts': 'Bài Đăng',
    'searchbar.articles': 'Bài Viết',
    'searchbar.events': 'Sự Kiện',
    'searchbar.noResultsFor': 'Không có kết quả cho',
    'searchbar.tryDifferent': 'Thử từ khóa khác hoặc kiểm tra chính tả',

    // ── Language Toggle ───────────────────────────────────────────────────
    'lang.en': 'EN',
    'lang.vi': 'VI',
  },
};
