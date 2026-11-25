import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CATEGORY_COLOR, STRINGS } from './i18n';

export function BlogShell({ lang, otherHref, children }) {
    const t = STRINGS[lang];
    return (
        <main className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 crt-overlay mix-blend-multiply pointer-events-none z-40" />
            <Navbar langSwitch={{ current: lang, otherHref }} />
            <div dir={t.dir} lang={lang} className={`flex-1 pt-24 md:pt-28 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {children}
            </div>
            <div dir="ltr"><Footer /></div>
        </main>
    );
}

export function CategoryTag({ category, lang, boxed = false, className = '' }) {
    const label = STRINGS[lang].categories[category] ?? category;
    const color = CATEGORY_COLOR[category] ?? '#7B9BF5';
    return (
        <span
            className={`${lang === 'ar' ? 'text-sm font-semibold' : 'font-mono text-[11px] tracking-[0.2em] font-bold'} ${boxed ? 'border px-2.5 py-1 bg-slate-950/70' : ''} ${className}`}
            style={{ color, borderColor: boxed ? `${color}80` : undefined }}
        >
            ● {label}
        </span>
    );
}

export function Cover({ src, alt, lang, className = '', imgClassName = '' }) {
    if (src) {
        return <img src={src} alt={alt} loading="lazy" className={`w-full h-full object-cover ${imgClassName} ${className}`} />;
    }
    return (
        <div
            aria-hidden="true"
            className={`w-full h-full flex items-center justify-center text-slate-600 ${lang === 'ar' ? 'text-sm' : 'font-mono text-[10px] tracking-[0.25em]'} ${className}`}
            style={{ background: 'repeating-linear-gradient(0deg, #0b0f17 0 2px, #111827 2px 4px)' }}
        >
            {STRINGS[lang].coverImage}
        </div>
    );
}

export function AuthorAvatar({ src, size = 48 }) {
    return (
        <div className="bg-black border border-slate-800 flex items-center justify-center overflow-hidden shrink-0" style={{ width: size, height: size }}>
            {src ? (
                <img src={src} alt="" className="w-full h-full object-cover" />
            ) : (
                <svg aria-hidden="true" width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="#334155">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            )}
        </div>
    );
}

export function CameraCorners() {
    const c = 'absolute w-[18px] h-[18px] border-white/75 pointer-events-none';
    return (
        <>
            <span aria-hidden="true" className={`${c} top-3 left-3 border-t-2 border-l-2`} />
            <span aria-hidden="true" className={`${c} top-3 right-3 border-t-2 border-r-2`} />
            <span aria-hidden="true" className={`${c} bottom-3 left-3 border-b-2 border-l-2`} />
            <span aria-hidden="true" className={`${c} bottom-3 right-3 border-b-2 border-r-2`} />
        </>
    );
}
