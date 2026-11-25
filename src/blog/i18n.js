
export const CATEGORIES = ['regional', 'technical', 'studio'];

export const CATEGORY_COLOR = {
    regional: '#FFB340',
    technical: '#C77DFF',
    studio: '#7B9BF5',
};

export const STRINGS = {
    en: {
        dir: 'ltr',
        blogPath: '/blog',
        categories: { all: 'ALL', regional: 'REGIONAL', technical: 'TECHNICAL', studio: 'STUDIO' },
        categoryBlurb: {
            regional: 'The Saudi and MENA gaming scene.',
            technical: 'Game tech, tools and development deep dives.',
            studio: 'Updates on Pexet Inc and the team.',
        },
        searchPlaceholder: 'SEARCH POSTS...',
        searchLabel: 'Search posts',
        featured: 'FEATURED',
        latest: 'LATEST',
        readPost: '[ READ POST ]',
        allPosts: 'ALL POSTS',
        postsCount: (n) => `${n} ${n === 1 ? 'POST' : 'POSTS'}`,
        loadMore: '[ LOAD MORE POSTS ]',
        empty: 'No posts here yet.',
        loadError: 'Posts could not be loaded. Please try again later.',
        minRead: (m) => `${m} MIN READ`,
        minShort: (m) => `${m} MIN`,
        backToBlog: '‹ BACK TO BLOG',
        previousPost: '‹ PREVIOUS POST',
        allPostsLink: 'ALL POSTS ›',
        backToTheBlog: 'Back to the blog',
        systemNote: 'SYSTEM NOTE',
        figure: 'FIG',
        source: 'Source',
        shareX: 'Share on X',
        copyLink: 'Copy link',
        copied: 'Link copied',
        discordText: ['Have thoughts on this post? ', 'Tune in on Discord', ' and join the conversation.'],
        discordButton: 'JOIN THE DISCORD',
        notFoundTitle: 'Post not found',
        notFoundText: 'This post may have been moved or taken down.',
        latestNewsTitle: 'Latest News',
        latestNewsText: 'Regional gaming news, technical deep dives and updates straight from the studio.',
        viewAllPosts: '[ VIEW ALL POSTS ]',
        coverImage: '[ COVER IMAGE ]',
        dateLocale: 'en-GB',
    },
    ar: {
        dir: 'rtl',
        blogPath: '/ar/blog',
        categories: { all: 'الكل', regional: 'محلية', technical: 'تقنية', studio: 'استوديو' },
        categoryBlurb: {
            regional: 'مشهد الألعاب في السعودية والمنطقة.',
            technical: 'تقنيات الألعاب وأدواتها وتفاصيل تطويرها.',
            studio: 'آخر أخبار Pexet Inc والفريق.',
        },
        searchPlaceholder: 'ابحث في المقالات...',
        searchLabel: 'ابحث في المقالات',
        featured: 'اختيارنا',
        latest: 'آخر الأخبار',
        readPost: '[ اقرأ المقال ]',
        allPosts: 'جميع المقالات',
        postsCount: (n) => `${n} ${n === 1 ? 'مقال' : 'مقالات'}`,
        loadMore: '[ عرض المزيد ]',
        empty: 'لا توجد مقالات هنا بعد.',
        loadError: 'تعذر تحميل المقالات. حاول مرة أخرى لاحقًا.',
        minRead: (m) => `قراءة في ${arMinutes(m)}`,
        minShort: (m) => arMinutes(m),
        backToBlog: '› العودة إلى المدونة',
        previousPost: '› المقال السابق',
        allPostsLink: 'جميع المقالات ‹',
        backToTheBlog: 'العودة إلى المدونة',
        systemNote: 'ملاحظة النظام',
        figure: 'شكل',
        source: 'المصدر',
        shareX: 'شارك على X',
        copyLink: 'نسخ الرابط',
        copied: 'تم نسخ الرابط',
        discordText: ['لديك رأي في هذا المقال؟ ', 'تواصل معنا على Discord', ' وشارك في النقاش.'],
        discordButton: 'انضم إلى Discord',
        notFoundTitle: 'المقال غير موجود',
        notFoundText: 'ربما نُقل هذا المقال أو حُذف.',
        latestNewsTitle: 'آخر الأخبار',
        latestNewsText: 'أخبار الألعاب في المنطقة، ومقالات تقنية، وتحديثات من الاستوديو.',
        viewAllPosts: '[ جميع المقالات ]',
        coverImage: '[ صورة الغلاف ]',
        dateLocale: 'ar-SA-u-nu-latn',
    },
};

function arMinutes(m) {
    if (m === 1) return 'دقيقة واحدة';
    if (m === 2) return 'دقيقتين';
    if (m <= 10) return `${m} دقائق`;
    return `${m} دقيقة`;
}

export function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

export function readMinutes(words) {
    return Math.max(1, Math.round((words || 0) / 200));
}

export function pick(obj, field, lang) {
    if (!obj) return '';
    return obj[`${field}_${lang}`] || obj[`${field}_en`] || obj[field] || '';
}

export function authorName(author, lang) {
    if (!author) return '';
    return (lang === 'ar' && author.display_name_ar) || author.display_name;
}

export function authorRole(author, lang) {
    if (!author) return '';
    return (lang === 'ar' && author.role_title_ar) || author.role_title || '';
}
