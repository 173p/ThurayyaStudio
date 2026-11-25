export const config = {
  matcher: ['/blog', '/blog/:slug*', '/ar/blog', '/ar/blog/:slug*'],
};

const SITE = 'https://thurayyastudio.com';
const DEFAULT_IMAGE = `${SITE}/pexet-banner.png`;
const BOTS = /bot|crawler|spider|preview|embed|facebookexternalhit|whatsapp|slack|telegram|discord|skype|pinterest|vkshare|qwantify|bitly/i;

const BLOG = {
  en: { title: 'Blog | Thurayya Studio', description: 'Regional gaming news, technical deep dives and updates straight from the studio.', site: 'Thurayya Studio' },
  ar: { title: 'المدونة | استوديو ثريا', description: 'أخبار الألعاب في المنطقة، ومقالات تقنية، وتحديثات من الاستوديو.', site: 'استوديو ثريا' },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setMeta(html, key, value) {
  const re = new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, `$1${esc(value)}$2`) : html.replace('</head>', `  <meta property="${key}" content="${esc(value)}">\n</head>`);
}

export function injectMeta(html, { title, description, image, url, type, lang }) {
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  if (lang === 'ar') out = out.replace(/<html lang="[^"]*"/, '<html lang="ar" dir="rtl"');
  const tags = {
    title, description,
    'og:type': type, 'og:url': url, 'og:title': title, 'og:description': description, 'og:image': image,
    'twitter:card': 'summary_large_image', 'twitter:url': url, 'twitter:title': title, 'twitter:description': description, 'twitter:image': image,
  };
  for (const [k, v] of Object.entries(tags)) out = setMeta(out, k, v);
  return out;
}

async function getPost(slug) {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key || !/^[a-z0-9-]+$/.test(slug)) return null;
  const res = await fetch(`${base}/rest/v1/posts?slug=eq.${slug}&select=title_en,title_ar,excerpt_en,excerpt_ar,cover_url&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

// Link-preview bots don't run JavaScript, so they get the post's title, excerpt and cover in the HTML.
export default async function middleware(request) {
  if (!BOTS.test(request.headers.get('user-agent') || '')) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/(ar\/)?blog(?:\/([^/]+))?\/?$/);
  if (!m) return new Response(null, { headers: { 'x-middleware-next': '1' } });

  const lang = m[1] ? 'ar' : 'en';
  const slug = m[2] ? decodeURIComponent(m[2]) : null;
  const html = await (await fetch(new URL('/index.html', request.url))).text();

  let meta = { ...BLOG[lang], image: DEFAULT_IMAGE, url: `${SITE}${url.pathname}`, type: 'website', lang };
  if (slug) {
    try {
      const post = await getPost(slug);
      if (post) {
        const title = (lang === 'ar' ? post.title_ar : post.title_en) || post.title_en || post.title_ar;
        const description = (lang === 'ar' ? post.excerpt_ar : post.excerpt_en) || post.excerpt_en || BLOG[lang].description;
        meta = { ...meta, title: `${title} | ${BLOG[lang].site}`, description, image: post.cover_url || DEFAULT_IMAGE, type: 'article' };
      }
    } catch {
      /* fall back to the blog defaults */
    }
  }

  return new Response(injectMeta(html, meta), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=600' },
  });
}
