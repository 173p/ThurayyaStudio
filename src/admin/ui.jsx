import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ADMIN_BASE, publicSiteUrl } from './client';

export const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);
export const to = (path = '') => `${ADMIN_BASE}${path === '/' ? '' : path}` || '/';

export const inputCls =
    'w-full min-h-[44px] bg-slate-950 border border-slate-700 text-white font-mono text-[13px] tracking-normal px-3 focus:border-[#305CDE] focus:outline-none disabled:opacity-50';

export function Field({ label, hint, children, className = '' }) {
    return (
        <label className={`flex flex-col gap-2 text-[10px] tracking-[0.3em] text-slate-400 font-mono ${className}`}>
            <span>
                {label}
                {hint && <span className="tracking-[0.1em] text-slate-500"> · {hint}</span>}
            </span>
            {children}
        </label>
    );
}

const BTN = {
    primary: 'bg-[#305CDE] text-white border border-[#305CDE] shadow-[4px_4px_0_#142257] hover:bg-[#3a68ec]',
    outline: 'bg-transparent text-[#7B9BF5] border border-[#305CDE]/50 hover:border-[#305CDE] hover:text-white',
    ghost: 'bg-transparent text-slate-300 border border-slate-700 hover:border-[#305CDE] hover:text-white',
    quiet: 'bg-transparent text-slate-400 border border-transparent hover:text-white',
    danger: 'bg-transparent text-red-300 border border-red-500/50 hover:bg-red-900/30 hover:border-red-500',
    dangerSolid: 'bg-red-800 text-white border border-red-500 hover:bg-red-700',
};

export function Btn({ variant = 'ghost', className = '', busy, children, ...rest }) {
    return (
        <button
            type="button"
            {...rest}
            disabled={busy || rest.disabled}
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 whitespace-nowrap font-mono text-xs font-bold tracking-[0.2em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
        >
            {busy ? <Spinner /> : null}
            {children}
        </button>
    );
}

export function IconBtn({ label, danger, className = '', children, ...rest }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            {...rest}
            className={`w-10 h-10 flex items-center justify-center border border-slate-700 text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${danger ? 'hover:border-red-500 hover:text-red-300' : 'hover:border-[#305CDE] hover:text-white'} ${className}`}
        >
            {children}
        </button>
    );
}

export function Spinner({ className = '' }) {
    return <span aria-hidden="true" className={`inline-block w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin ${className}`} />;
}

export function ErrorNote({ children }) {
    if (!children) return null;
    return (
        <p role="alert" className="font-mono text-xs leading-relaxed text-red-300 border border-red-500/40 bg-red-900/20 px-3 py-2.5">
            {children}
        </p>
    );
}

export function Modal({ label, onClose, danger, wide, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={`w-full ${wide ? 'max-w-5xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto bg-slate-900 border p-7 font-mono ${danger ? 'border-red-900 shadow-[6px_6px_0_#3b0d0d]' : 'border-slate-700 shadow-[6px_6px_0_#0d1736]'}`}
            >
                {children}
            </div>
        </div>
    );
}

export function ConfirmDelete({ kicker, title, text, onCancel, onConfirm, busy, confirmLabel = '[ DELETE ]' }) {
    return (
        <Modal label="Confirm" onClose={onCancel} danger>
            <div className="text-[11px] tracking-[0.3em] text-red-400 font-bold mb-3.5">{kicker}</div>
            <p className="font-sans text-xl font-bold leading-snug mb-2 text-white">{title}</p>
            <p className="text-slate-400 text-[13px] leading-relaxed mb-7">{text}</p>
            <div className="flex gap-3">
                <Btn className="flex-1" onClick={onCancel}>[ CANCEL ]</Btn>
                <Btn className="flex-1" variant="dangerSolid" busy={busy} onClick={onConfirm}>{confirmLabel}</Btn>
            </div>
        </Modal>
    );
}

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastHost({ children }) {
    const [items, setItems] = useState([]);
    const push = useCallback((text, kind = 'ok') => {
        const id = Math.random();
        setItems((x) => [...x, { id, text, kind }]);
        setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), kind === 'error' ? 7000 : 3500);
    }, []);
    return (
        <ToastContext.Provider value={push}>
            {children}
            <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
                {items.map((t) => (
                    <div
                        key={t.id}
                        className={`font-mono text-xs leading-relaxed px-4 py-3 border bg-slate-900 shadow-[4px_4px_0_#0d1736] ${t.kind === 'error' ? 'border-red-500/60 text-red-200' : 'border-[#305CDE]/60 text-slate-200'}`}
                    >
                        {t.text}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function PageHead({ kicker, title, children }) {
    return (
        <div className="flex flex-wrap justify-between items-end gap-5 mb-8">
            <div>
                <p className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.45em] text-[#7B9BF5]">{kicker}</p>
                <h1 className="m-0 font-sans text-4xl font-extrabold tracking-tight">{title}</h1>
            </div>
            {children && <div className="flex flex-wrap gap-3 items-center">{children}</div>}
        </div>
    );
}

const navCls = ({ isActive }) =>
    `px-3.5 py-3 border ${isActive ? 'text-white bg-[#305CDE]/15 border-[#305CDE]/50' : 'text-slate-400 border-transparent hover:text-white'}`;

export function Layout({ children }) {
    const { me, isAdmin, signOut } = useAdmin();
    const [open, setOpen] = useState(false);
    const nav = (
        <nav className="flex flex-col gap-1 text-xs font-bold tracking-[0.18em]" onClick={() => setOpen(false)}>
            <NavLink end to={to('/')} className={navCls}>POSTS</NavLink>
            <NavLink to={to('/posts/new')} className={navCls}>+ NEW POST</NavLink>
            <NavLink to={to('/media')} className={navCls}>MEDIA</NavLink>
            {isAdmin && <NavLink to={to('/authors')} className={navCls}>AUTHORS</NavLink>}
        </nav>
    );
    return (
        <div className="min-h-screen bg-slate-950 text-white font-mono lg:flex">
            <aside className="lg:w-[260px] lg:shrink-0 lg:min-h-screen bg-[#0b0f17] border-b lg:border-b-0 lg:border-r border-slate-800 px-5 py-5 lg:py-7 flex lg:flex-col gap-7 lg:sticky lg:top-0 lg:h-screen">
                <div className="flex items-center justify-between w-full lg:block">
                    <a href={publicSiteUrl('/')} target="_blank" rel="noopener noreferrer" aria-label="Open the public site">
                        <img src="/logo-transparent-white.png" alt="Thurayya Studio" className="h-12 lg:h-[72px] block" />
                    </a>
                    <button className="lg:hidden min-h-[44px] px-4 border border-slate-700 text-xs tracking-[0.2em] font-bold" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                        {open ? '[ CLOSE ]' : '[ MENU ]'}
                    </button>
                </div>
                <div className="hidden lg:block text-[10px] tracking-[0.3em] text-red-400 border border-red-500/35 bg-red-900/20 px-2.5 py-1.5 self-start">AUTHORIZED PERSONNEL</div>
                <div className="hidden lg:block">{nav}</div>
                <div className="hidden lg:block mt-auto pt-5 border-t border-slate-800 text-[11px] leading-[1.8] text-slate-400">
                    <div className="text-[#7B9BF5] font-bold tracking-[0.15em] uppercase">{me?.display_name}</div>
                    <div>{[me?.role_title, me?.access_role?.toUpperCase()].filter(Boolean).join(' // ')}</div>
                    <button onClick={signOut} className="mt-2.5 text-slate-400 hover:text-white tracking-[0.2em]">[ LOG OUT ]</button>
                </div>
            </aside>
            {open && (
                <div className="lg:hidden bg-[#0b0f17] border-b border-slate-800 px-5 pb-5 flex flex-col gap-5">
                    {nav}
                    <div className="text-[11px] text-slate-400 flex justify-between items-center">
                        <span className="text-[#7B9BF5] font-bold tracking-[0.15em] uppercase">{me?.display_name}</span>
                        <button onClick={signOut} className="tracking-[0.2em] min-h-[44px]">[ LOG OUT ]</button>
                    </div>
                </div>
            )}
            <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-12 py-8 lg:py-10 pb-16">{children}</main>
        </div>
    );
}

export function NotFound() {
    return (
        <div className="py-24 text-center">
            <p className="text-slate-400 mb-6">This page doesn't exist.</p>
            <Link to={to('/')} className="text-[#7B9BF5]">[ BACK TO POSTS ]</Link>
        </div>
    );
}

export const CATEGORY_LABEL = { regional: 'REGIONAL', technical: 'TECHNICAL', studio: 'STUDIO' };

export function liveState(p) {
    if (p.status === 'draft') return 'draft';
    if (!p.publish_at || new Date(p.publish_at) > new Date()) return 'scheduled';
    return 'published';
}
export const STATE_COLOR = { published: '#4ade80', draft: '#FFB340', scheduled: '#C77DFF' };

export function fmtDate(iso) {
    if (!iso) return '--';
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

export function timeAgo(iso) {
    if (!iso) return 'Never';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 3600) return 'Just now';
    const d = Math.floor(s / 86400);
    if (d < 1) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d} days ago`;
    if (d < 30) return `${Math.floor(d / 7)} week${d < 14 ? '' : 's'} ago`;
    return fmtDate(iso);
}

export function fmtBytes(n) {
    if (!n) return '0 KB';
    if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
