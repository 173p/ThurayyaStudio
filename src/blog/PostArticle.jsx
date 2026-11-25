import React from 'react';
import { Link } from 'react-router-dom';
import { STRINGS, formatDate, pick, readMinutes, authorName, authorRole } from './i18n';
import { CategoryTag, AuthorAvatar } from './components';
import PostBody from './PostBody';

export default function PostArticle({ post, lang, preview = false, children }) {
    const t = STRINGS[lang];
    const isAr = lang === 'ar';
    const monoSm = isAr ? 'text-sm' : 'font-mono text-xs tracking-[0.2em]';
    const title = pick(post, 'title', lang);
    const words = post[`words_${lang}`] ?? (pick(post, 'body', lang) || '').trim().split(/\s+/).filter(Boolean).length;

    return (
        <>
            <div className={`relative h-[460px] bg-black ${preview ? '' : '-mt-24 md:-mt-28'}`}>
                {post.cover_url && <img src={post.cover_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center 35%' }} />}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 to-slate-950" />
            </div>

            <article className="relative max-w-[760px] mx-auto -mt-52 px-6 pb-20">
                {preview ? (
                    <span className={`inline-block mb-5 text-slate-300 font-bold ${monoSm}`}>{t.backToBlog}</span>
                ) : (
                    <Link to={t.blogPath} className={`inline-block mb-5 text-slate-300 hover:text-white font-bold ${monoSm}`}>{t.backToBlog}</Link>
                )}
                <div className="flex flex-wrap gap-3 items-center mb-5">
                    <CategoryTag category={post.category} lang={lang} boxed />
                    <span className={`text-slate-400 ${monoSm}`}>· {t.minRead(readMinutes(words))}</span>
                </div>
                <h1 className="text-4xl md:text-[56px] leading-[1.08] tracking-tight font-bold mb-7">{title}</h1>

                <div className="flex items-center gap-4 py-4 border-y border-slate-800 mb-10">
                    <AuthorAvatar src={post.author?.avatar_url} />
                    <div className={isAr ? '' : 'font-mono'}>
                        <div className={`text-[#7B9BF5] font-bold ${isAr ? 'text-base' : 'text-sm tracking-[0.1em] uppercase'}`}>{authorName(post.author, lang)}</div>
                        <div className={`text-slate-400 mt-1 ${isAr ? 'text-sm' : 'text-xs'}`}>
                            {[authorRole(post.author, lang), post.publish_at ? formatDate(post.publish_at) : null].filter(Boolean).join(' · ')}
                        </div>
                    </div>
                </div>

                <PostBody markdown={pick(post, 'body', lang)} lang={lang} />

                {post.source_name && (
                    <p className={`mt-8 text-slate-400 ${isAr ? 'text-sm' : 'font-mono text-xs tracking-[0.1em]'}`}>
                        {t.source}:{' '}
                        {post.source_url
                            ? <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="text-[#7B9BF5] underline underline-offset-4">{post.source_name}</a>
                            : post.source_name}
                    </p>
                )}

                {children}
            </article>
        </>
    );
}
