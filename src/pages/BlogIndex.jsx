import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listPosts } from '../blog/api';
import { CATEGORIES, STRINGS, formatDate, pick, readMinutes, authorName } from '../blog/i18n';
import { BlogShell, CategoryTag, Cover, CameraCorners } from '../blog/components';

const PAGE_SIZE = 9;

const BlogIndex = ({ lang }) => {
    const t = STRINGS[lang];
    const isAr = lang === 'ar';
    const [params, setParams] = useSearchParams();
    const cat = CATEGORIES.includes(params.get('cat')) ? params.get('cat') : 'all';
    const [posts, setPosts] = useState(null);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState('');
    const [shown, setShown] = useState(PAGE_SIZE);

    useEffect(() => {
        document.title = isAr ? 'المدونة | استوديو ثريا' : 'Blog | Thurayya Studio';
        document.documentElement.lang = lang;
        return () => { document.documentElement.lang = 'en'; };
    }, [lang, isAr]);

    useEffect(() => {
        let alive = true;
        listPosts()
            .then((p) => alive && setPosts(p))
            .catch(() => alive && setError(true));
        return () => { alive = false; };
    }, []);

    const filtered = useMemo(() => {
        if (!posts) return [];
        const q = query.trim().toLowerCase();
        return posts.filter((p) => {
            if (cat !== 'all' && p.category !== cat) return false;
            if (!q) return true;
            return `${pick(p, 'title', lang)} ${pick(p, 'excerpt', lang)}`.toLowerCase().includes(q);
        });
    }, [posts, cat, query, lang]);

    const featured = cat === 'all' && !query && posts?.length ? (posts.find((p) => p.featured) ?? posts[0]) : null;
    const grid = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;

    const setCat = (c) => {
        setShown(PAGE_SIZE);
        if (c === 'all') params.delete('cat'); else params.set('cat', c);
        setParams(params, { replace: true });
    };

    const otherHref = `${isAr ? '/blog' : '/ar/blog'}${cat !== 'all' ? `?cat=${cat}` : ''}`;
    const postHref = (slug) => `${t.blogPath}/${slug}`;
    const pillText = isAr ? 'text-sm' : 'font-mono text-[11px] tracking-[0.2em] font-bold';

    return (
        <BlogShell lang={lang} otherHref={otherHref}>
            <div className="container mx-auto px-6 max-w-[1240px] pt-10 pb-24">

                <div className="flex flex-wrap justify-between items-center gap-4 py-4 border-y border-slate-800 mb-12">
                    <div className={`flex flex-wrap gap-2.5 ${pillText}`}>
                        {['all', ...CATEGORIES].map((c) => {
                            const on = c === cat;
                            return (
                                <button
                                    key={c}
                                    onClick={() => setCat(c)}
                                    aria-pressed={on}
                                    className={`min-h-[44px] px-4 border transition-colors ${on ? 'bg-[#305CDE]/15 border-[#305CDE] text-white' : 'border-slate-700 text-slate-400 hover:border-[#305CDE] hover:text-white'}`}
                                >
                                    {t.categories[c]}
                                </button>
                            );
                        })}
                    </div>
                    <label className="flex items-center gap-2.5 border border-slate-700 bg-[#0b0f17] px-3.5 h-11 text-slate-400 focus-within:border-[#305CDE]">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                        <input
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }}
                            aria-label={t.searchLabel}
                            placeholder={t.searchPlaceholder}
                            className={`bg-transparent outline-none text-white w-52 placeholder:text-slate-500 ${isAr ? 'text-sm' : 'font-mono text-xs tracking-[0.15em]'}`}
                        />
                    </label>
                </div>

                {error && <p className="text-slate-400 py-16 text-center">{t.loadError}</p>}

                {!error && !posts && (
                    <div aria-hidden="true" className="grid gap-7 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                        {[0, 1, 2].map((i) => <div key={i} className="h-80 bg-[#0b0f17] border border-slate-800 animate-pulse" />)}
                    </div>
                )}

                {featured && (
                    <Link to={postHref(featured.slug)} className="group flex flex-wrap border border-slate-800 bg-[#0b0f17] rounded-md overflow-hidden mb-14 hover:border-[#305CDE] transition-colors">
                        <div className="relative flex-[1_1_560px] min-h-[340px] bg-black">
                            <Cover src={featured.cover_url} alt="" lang={lang} />
                            <CameraCorners />
                            <span className="absolute top-[18px] start-10 font-mono text-[11px] tracking-widest text-white/80"><bdi dir="ltr"><span className="text-red-500">●</span> REC&nbsp; CAM_03</bdi></span>
                            <span className="absolute bottom-[18px] start-10 font-mono text-[11px] tracking-widest text-white/70">{formatDate(featured.publish_at)}</span>
                            <div className={`absolute inset-0 ${isAr ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-transparent from-60% to-[#0b0f17]`} />
                        </div>
                        <div className="flex-[1_1_420px] p-10 md:p-11 flex flex-col gap-4">
                            <div className={`flex justify-between ${pillText}`}>
                                <span className="text-[#a8a9ab]">{t.featured}</span>
                                <span className="text-red-400 border border-red-500/40 bg-red-900/25 px-2">{t.latest}</span>
                            </div>
                            <CategoryTag category={featured.category} lang={lang} />
                            <h2 className="text-3xl md:text-[38px] font-bold leading-tight tracking-tight">{pick(featured, 'title', lang)}</h2>
                            <p className="text-slate-400 text-[17px] leading-relaxed">{pick(featured, 'excerpt', lang)}</p>
                            <div className={`mt-auto pt-5 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4 text-slate-400 ${isAr ? 'text-sm' : 'font-mono text-xs tracking-[0.1em]'}`}>
                                <span>{authorName(featured.author, lang)} · {formatDate(featured.publish_at)} · {t.minShort(readMinutes(featured[`words_${lang}`]))}</span>
                                <span className={`text-white border border-[#305CDE]/60 px-4 py-2.5 font-bold group-hover:bg-[#305CDE]/10 ${isAr ? '' : 'tracking-[0.2em]'}`}>{t.readPost}</span>
                            </div>
                        </div>
                    </Link>
                )}

                {posts && (
                    <>
                        <div className={`flex justify-between items-baseline mb-6 ${isAr ? '' : 'font-mono'}`}>
                            <h1 className={`text-xl text-[#7B9BF5] m-0 ${isAr ? 'font-bold' : 'tracking-[0.2em]'}`}>{t.allPosts}</h1>
                            <span className={`text-slate-500 ${isAr ? 'text-sm' : 'text-[11px] tracking-[0.2em]'}`}>{t.postsCount(grid.length)}</span>
                        </div>

                        {grid.length === 0 ? (
                            <p className="text-slate-400 py-16 text-center">{t.empty}</p>
                        ) : (
                            <div className="grid gap-7 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                                {grid.slice(0, shown).map((p) => (
                                    <Link
                                        key={p.slug}
                                        to={postHref(p.slug)}
                                        className="flex flex-col bg-slate-900/80 border border-slate-800 border-t-4 border-t-slate-700 rounded-b-md overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[#305CDE] hover:shadow-[6px_6px_0_#142257]"
                                    >
                                        {p.cover_url && <div className="h-[170px] bg-black opacity-80"><Cover src={p.cover_url} alt="" lang={lang} /></div>}
                                        <div className="p-6 flex flex-col gap-3.5 flex-grow">
                                            <div className="flex justify-between pb-3 border-b border-slate-800">
                                                <span dir="ltr" className="font-mono text-[11px] font-bold tracking-[0.15em] text-slate-500">#{String(p.id).padStart(3, '0')}</span>
                                                <CategoryTag category={p.category} lang={lang} />
                                            </div>
                                            <h3 className="text-[21px] font-semibold leading-snug m-0">{pick(p, 'title', lang)}</h3>
                                            <p className="text-slate-400 text-[15px] leading-relaxed m-0">{pick(p, 'excerpt', lang)}</p>
                                            <span className={`mt-auto text-slate-400 ${isAr ? 'text-sm' : 'font-mono text-[11px] tracking-[0.1em]'}`}>
                                                {authorName(p.author, lang)} · {formatDate(p.publish_at)} · {t.minShort(readMinutes(p[`words_${lang}`]))}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {grid.length > shown && (
                            <div className="text-center mt-14">
                                <button
                                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                                    className={`bracket-btn text-[#7B9BF5] px-10 py-4 font-bold border border-[#305CDE]/50 ${isAr ? 'text-base' : 'font-mono text-[13px] tracking-[0.2em]'}`}
                                >
                                    {t.loadMore}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </BlogShell>
    );
};

export default BlogIndex;
