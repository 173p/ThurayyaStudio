import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { STRINGS } from './i18n';

function youtubeId(src = '') {
    const m = String(src).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
}

export default function PostBody({ markdown, lang }) {
    const t = STRINGS[lang];
    const isAr = lang === 'ar';
    const mono = isAr ? '' : 'font-mono tracking-[0.2em]';
    let fig = 0;

    const components = {
        h2: ({ children }) => <h2 className={`mt-11 mb-4 text-lg font-bold text-white ${mono}`}>{children}</h2>,
        h3: ({ children }) => <h3 className={`mt-9 mb-3 text-base font-bold text-white ${mono}`}>{children}</h3>,
        p: ({ node, children }) => {
            if (node?.children?.length === 1 && node.children[0].tagName === 'img') return <>{children}</>;
            return <p className="mb-6">{children}</p>;
        },
        a: ({ href, children }) => {
            const external = /^https?:\/\//.test(href || '');
            return (
                <a href={href} className="text-[#7B9BF5] underline underline-offset-4 hover:text-white" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {children}
                </a>
            );
        },
        ul: ({ children }) => <ul className="mb-6 ps-6 list-disc space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="mb-6 ps-6 list-decimal space-y-2">{children}</ol>,
        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
        code: ({ children }) => <code className="font-mono text-[0.9em] bg-[#0b0f17] border border-slate-800 px-1.5 py-0.5">{children}</code>,
        blockquote: ({ children }) => (
            <aside className={`my-9 px-6 py-5 bg-[#0b0f17] border border-slate-800 text-slate-400 text-[15px] leading-relaxed ${isAr ? '' : 'font-mono'}`}>
                <div className={`text-red-400 text-[11px] font-bold mb-2.5 ${isAr ? 'text-sm' : 'tracking-[0.25em]'}`}>{t.systemNote}</div>
                <div className="[&_p]:mb-0">{children}</div>
            </aside>
        ),
        img: ({ src, alt }) => {
            fig += 1;
            const yt = youtubeId(src);
            const isVideo = /\.(mp4|webm)(\?|$)/i.test(src || '');
            return (
                <figure className="my-9">
                    {yt ? (
                        <div className="relative w-full aspect-video border border-slate-800 bg-black">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${yt}`}
                                title={alt || 'Video'}
                                loading="lazy"
                                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    ) : isVideo ? (
                        <video src={src} controls preload="metadata" className="w-full block border border-slate-800 bg-black" />
                    ) : (
                        <img src={src} alt={alt || ''} loading="lazy" className="w-full block border border-slate-800" />
                    )}
                    {alt && (
                        <figcaption className={`mt-2.5 text-slate-400 ${isAr ? 'text-sm' : 'font-mono text-[11px] tracking-[0.15em]'}`}>
                            {t.figure} {String(fig).padStart(2, '0')}
                        </figcaption>
                    )}
                </figure>
            );
        },
        hr: () => <hr className="my-10 border-slate-800" />,
        table: ({ children }) => <div className="my-8 overflow-x-auto"><table className="w-full text-sm border-collapse">{children}</table></div>,
        th: ({ children }) => <th className="text-start border-b border-slate-700 py-2 pe-4 text-white">{children}</th>,
        td: ({ children }) => <td className="border-b border-slate-800 py-2 pe-4">{children}</td>,
    };

    return (
        <div className={`text-slate-300 ${isAr ? 'text-[19px] leading-[1.95]' : 'text-lg leading-[1.8]'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {markdown || ''}
            </ReactMarkdown>
        </div>
    );
}
