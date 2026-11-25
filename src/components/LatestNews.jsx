import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPosts } from '../blog/api';
import { CATEGORIES, CATEGORY_COLOR, STRINGS, formatDate } from '../blog/i18n';
import { Cover, CameraCorners } from '../blog/components';

const t = STRINGS.en;

const LatestNews = () => {
    const [posts, setPosts] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let alive = true;
        listPosts({ limit: 3 })
            .then((p) => alive && setPosts(p))
            .catch((e) => {
                console.warn('[blog] Latest News could not load posts:', e);
                if (alive) { setFailed(true); setPosts([]); }
            });
        return () => { alive = false; };
    }, []);

    const [first, ...rest] = posts ?? [];

    return (
        <section id="blog" className="w-full bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
            <div className="container mx-auto px-6 py-24 relative z-10 flex flex-col lg:flex-row gap-16 items-center">

                <div className="w-full lg:w-1/2 xl:pr-8 flex flex-col gap-6">
                    <h2 className="text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-none">{t.latestNewsTitle}</h2>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-xl">{t.latestNewsText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {CATEGORIES.map((c) => (
                            <Link
                                key={c}
                                to={`/ar/blog?cat=${c}`}
                                className="block bg-[#0b0f17] border border-slate-800 rounded-md p-4 hover:border-[#305CDE]/60 hover:bg-[#0d131f] transition-colors"
                            >
                                <span className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.18em] mb-2" style={{ color: CATEGORY_COLOR[c] }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                                    {t.categories[c]}
                                </span>
                                <span className="block text-sm text-slate-400 leading-snug">{t.categoryBlurb[c]}</span>
                            </Link>
                        ))}
                    </div>
                    <Link
                        to="/ar/blog"
                        className="bracket-btn self-start mt-2 text-[#305CDE] font-mono tracking-[0.2em] px-9 py-4 border border-[#305CDE]/50 text-sm font-bold"
                    >
                        {t.viewAllPosts}
                    </Link>
                </div>

                {posts && !first ? (
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div
                            className="w-64 aspect-square rounded-md border border-slate-800 flex flex-col items-center justify-center gap-3 text-center px-6"
                            style={{ background: 'repeating-linear-gradient(0deg, #0b0f17 0 2px, #111827 2px 4px)' }}
                        >
                            <span className="font-mono text-xs font-bold tracking-[0.3em] text-slate-400">NO SIGNAL</span>
                            <span className="font-mono text-[11px] tracking-[0.15em] text-slate-500 leading-relaxed">
                                {failed ? 'POSTS COULD NOT LOAD' : 'FIRST POST COMING SOON'}
                            </span>
                        </div>
                    </div>
                ) : (
                <div className="w-full lg:w-1/2 bg-[#0b0f17] border border-slate-800 rounded-md overflow-hidden p-3 grid grid-cols-2 gap-3">
                    {!posts && (
                        <>
                            <div aria-hidden="true" className="col-span-2 h-72 bg-slate-900/60 animate-pulse" />
                            <div aria-hidden="true" className="h-48 bg-slate-900/60 animate-pulse" />
                            <div aria-hidden="true" className="h-48 bg-slate-900/60 animate-pulse" />
                        </>
                    )}
                    {first && (
                    <Link to={`/ar/blog/${first.slug}`} className="group col-span-2 relative block aspect-[16/8] min-h-56 bg-black border border-slate-800 overflow-hidden">
                        <Cover src={first.cover_url} alt="" lang="en" imgClassName="" />
                        <CameraCorners />
                        <span className="absolute top-4 left-9 font-mono text-[11px] tracking-widest text-white/85">CAM_07 <span className="text-[#a8a9ab]">{t.latest}</span></span>
                        <span className="absolute top-4 right-9 font-mono text-[11px] text-white/70">{formatDate(first.publish_at)}</span>
                        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-12 bg-gradient-to-b from-transparent to-slate-950/95">
                            <span className="block font-mono text-[10px] font-bold tracking-[0.2em] mb-1.5" style={{ color: CATEGORY_COLOR[first.category] }}>{t.categories[first.category]}</span>
                            <span className="block text-xl font-bold leading-snug">{first.title_en}</span>
                        </div>
                    </Link>
                    )}
                    {rest.map((p, i) => (
                        <Link key={p.slug} to={`/ar/blog/${p.slug}`} className="group block border border-slate-800 bg-slate-950 hover:border-[#305CDE] transition-colors">
                            <div className="relative aspect-[16/7] bg-black overflow-hidden">
                                <Cover src={p.cover_url} alt="" lang="en" imgClassName="" />
                                <span className="absolute top-2 left-2.5 font-mono text-[10px] tracking-widest text-white/80">CAM_0{6 - i}</span>
                                <span className="absolute top-2 right-2.5 font-mono text-[10px] text-white/65">{formatDate(p.publish_at)}</span>
                            </div>
                            <div className="p-3">
                                <span className="block font-mono text-[10px] font-bold tracking-[0.2em] mb-1.5" style={{ color: CATEGORY_COLOR[p.category] }}>{t.categories[p.category]}</span>
                                <span className="block text-[15px] font-semibold leading-snug">{p.title_en}</span>
                            </div>
                        </Link>
                    ))}
                </div>
                )}
            </div>
        </section>
    );
};

export default LatestNews;
