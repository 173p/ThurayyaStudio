import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaDiscord, FaXTwitter } from 'react-icons/fa6';
import { getPost, getPreviousPost, recordView } from '../blog/api';
import { STRINGS, pick } from '../blog/i18n';
import { BlogShell } from '../blog/components';
import PostArticle from '../blog/PostArticle';

function setMeta(name, content, attr = 'name') {
    let el = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

const PostPage = ({ lang }) => {
    const t = STRINGS[lang];
    const isAr = lang === 'ar';
    const { slug } = useParams();
    const [post, setPost] = useState(undefined);
    const [prev, setPrev] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let alive = true;
        setPost(undefined);
        setPrev(null);
        getPost(slug)
            .then((p) => {
                if (!alive) return;
                setPost(p);
                if (p) {
                    recordView(p.slug);
                    getPreviousPost(p.publish_at).then((x) => alive && setPrev(x), () => {});
                }
            })
            .catch(() => alive && setPost(null));
        return () => { alive = false; };
    }, [slug]);

    useEffect(() => {
        document.documentElement.lang = lang;
        if (post) {
            const title = pick(post, 'title', lang);
            document.title = `${title} | ${isAr ? 'استوديو ثريا' : 'Thurayya Studio'}`;
            setMeta('description', pick(post, 'excerpt', lang));
            setMeta('og:title', title, 'property');
            setMeta('og:description', pick(post, 'excerpt', lang), 'property');
            if (post.cover_url) setMeta('og:image', post.cover_url, 'property');
        }
        return () => { document.documentElement.lang = 'en'; };
    }, [post, lang, isAr]);

    const otherHref = `${isAr ? '/blog' : '/ar/blog'}/${slug}`;
    const monoSm = isAr ? 'text-sm' : 'font-mono text-xs tracking-[0.2em]';

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    };

    if (post === undefined) {
        return (
            <BlogShell lang={lang} otherHref={otherHref}>
                <div aria-hidden="true" className="max-w-[760px] mx-auto px-6 pt-16 space-y-6">
                    <div className="h-10 w-3/4 bg-[#0b0f17] animate-pulse" />
                    <div className="h-64 bg-[#0b0f17] animate-pulse" />
                </div>
            </BlogShell>
        );
    }

    if (post === null) {
        return (
            <BlogShell lang={lang} otherHref={isAr ? '/blog' : '/ar/blog'}>
                <div className="max-w-[760px] mx-auto px-6 py-32 text-center">
                    <h1 className="text-4xl font-bold mb-4">{t.notFoundTitle}</h1>
                    <p className="text-slate-400 mb-10">{t.notFoundText}</p>
                    <Link to={t.blogPath} className={`bracket-btn inline-block text-[#7B9BF5] px-9 py-4 font-bold border border-[#305CDE]/50 ${monoSm}`}>{t.backToBlog}</Link>
                </div>
            </BlogShell>
        );
    }

    const title = pick(post, 'title', lang);
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`;

    return (
        <BlogShell lang={lang} otherHref={otherHref}>
            <PostArticle post={post} lang={lang}>
                <div className="flex justify-end items-center gap-2.5 mt-14 pt-6 border-t border-slate-800">
                    {copied && <span className={`text-slate-400 ${monoSm}`} role="status">{t.copied}</span>}
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" aria-label={t.shareX} className="w-11 h-11 flex items-center justify-center border border-[#305CDE]/30 text-slate-400 hover:text-white hover:border-[#305CDE]">
                        <FaXTwitter aria-hidden="true" />
                    </a>
                    <button onClick={copyLink} aria-label={t.copyLink} className="w-11 h-11 flex items-center justify-center border border-[#305CDE]/30 text-slate-400 hover:text-white hover:border-[#305CDE]">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
                    </button>
                </div>

                <div className="grid gap-5 mt-12 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {prev && (
                        <Link to={`${t.blogPath}/${prev.slug}`} className="block p-5 border border-slate-800 bg-[#0b0f17] hover:border-[#305CDE] transition-colors">
                            <div className={`text-slate-400 mb-2.5 ${isAr ? 'text-sm' : 'font-mono text-[11px] tracking-[0.2em]'}`}>{t.previousPost}</div>
                            <div className="text-[17px] font-semibold leading-snug">{pick(prev, 'title', lang)}</div>
                        </Link>
                    )}
                    <Link to={t.blogPath} className="block p-5 border border-slate-800 bg-[#0b0f17] hover:border-[#305CDE] transition-colors text-end">
                        <div className={`text-slate-400 mb-2.5 ${isAr ? 'text-sm' : 'font-mono text-[11px] tracking-[0.2em]'}`}>{t.allPostsLink}</div>
                        <div className="text-[17px] font-semibold leading-snug">{t.backToTheBlog}</div>
                    </Link>
                </div>
            </PostArticle>

            <section className="border-t border-slate-800 py-12 px-6 flex flex-col items-center gap-5 text-center relative z-10">
                <p className={`max-w-md text-slate-400 leading-relaxed ${isAr ? 'text-base' : 'font-mono text-sm tracking-wide'}`}>
                    {t.discordText[0]}<span className="text-[#7B9BF5]">{t.discordText[1]}</span>{t.discordText[2]}
                </p>
                <a
                    href="https://discord.gg/EEkV5d3kbR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-3 min-h-[52px] px-8 border border-[#305CDE]/60 text-slate-300 font-bold hover:bg-[#305CDE] hover:text-white transition-colors ${isAr ? 'text-base' : 'font-mono text-sm tracking-[0.3em]'}`}
                >
                    <FaDiscord className="text-xl" aria-hidden="true" />
                    {t.discordButton}
                </a>
            </section>
        </BlogShell>
    );
};

export default PostPage;
