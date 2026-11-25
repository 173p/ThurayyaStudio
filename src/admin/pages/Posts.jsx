import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sb, friendlyError, publicSiteUrl } from '../client';
import { CATEGORY_COLOR } from '../../blog/i18n';
import { Btn, ConfirmDelete, ErrorNote, IconBtn, PageHead, CATEGORY_LABEL, STATE_COLOR, fmtDate, liveState, to, useAdmin, useToast } from '../ui';

const FILTERS = ['all', 'published', 'scheduled', 'draft'];

function Stat({ label, value, color, small }) {
    return (
        <div className="border border-slate-800 bg-[#0b0f17] px-5 py-[18px] min-w-0" style={{ borderTop: `3px solid ${color}` }}>
            <div className="text-[10px] tracking-[0.25em] text-slate-400">{label}</div>
            <div className={`font-sans mt-1.5 ${small ? 'text-[15px] font-bold mt-2.5 leading-snug line-clamp-2' : 'text-[34px] font-extrabold'}`}>{value}</div>
        </div>
    );
}

function Bars({ values }) {
    const max = Math.max(1, ...(values ?? []));
    const list = values?.length ? values : [0, 0, 0, 0, 0, 0, 0];
    return (
        <div aria-label={`Views over the last 7 days: ${list.join(', ')}`} className="flex items-end gap-[3px] h-[26px]">
            {list.map((v, i) => (
                <div key={i} title={`${v}`} className="w-[7px]" style={{ height: `${Math.max(3, Math.round((v / max) * 26))}px`, background: v ? '#305CDE' : '#1e293b' }} />
            ))}
        </div>
    );
}

export default function Posts() {
    const { me, isAdmin } = useAdmin();
    const toast = useToast();
    const navigate = useNavigate();
    const [posts, setPosts] = useState(null);
    const [stats, setStats] = useState({});
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [ask, setAsk] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = async () => {
        const [p, s] = await Promise.all([
            sb.from('posts').select('id, slug, category, status, publish_at, updated_at, title_en, title_ar, featured, author_id, author:authors(display_name)').order('updated_at', { ascending: false }),
            sb.rpc('post_view_stats'),
        ]);
        if (p.error) return setError(friendlyError(p.error));
        setPosts(p.data);
        setStats(Object.fromEntries((s.data ?? []).map((r) => [r.post_id, r])));
    };

    useEffect(() => { load(); }, []);

    const rows = useMemo(() => (posts ?? []).map((p) => ({ ...p, state: liveState(p), st: stats[p.id] })), [posts, stats]);
    const shown = rows.filter((r) => filter === 'all' || r.state === filter);
    const count = (s) => rows.filter((r) => r.state === s).length;
    const views30 = rows.reduce((a, r) => a + Number(r.st?.last30 ?? 0), 0);
    const top = rows.filter((r) => r.st?.last30 > 0).sort((a, b) => b.st.last30 - a.st.last30)[0];

    const canEdit = (p) => isAdmin || p.author_id === me.id;

    const del = async () => {
        setBusy(true);
        const { error } = await sb.from('posts').delete().eq('id', ask.id);
        setBusy(false);
        if (error) return toast(friendlyError(error), 'error');
        toast('Post deleted.');
        setAsk(null);
        load();
    };

    const publicUrl = (p) => publicSiteUrl(`/blog/${p.slug}`);

    return (
        <>
            <PageHead kicker="ADMIN PANEL" title="Manage Posts">
                <Btn variant="primary" className="min-h-[50px] px-6 text-[13px]" onClick={() => navigate(to('/posts/new'))}>[ + NEW POST ]</Btn>
            </PageHead>

            <div className="grid gap-3 sm:gap-4 mb-8 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
                <Stat label="PUBLISHED" value={count('published')} color="#305CDE" />
                <Stat label="DRAFTS" value={count('draft')} color="#FF9500" />
                <Stat label="SCHEDULED" value={count('scheduled')} color="#AF52DE" />
                <Stat label="VIEWS · LAST 30 DAYS" value={views30.toLocaleString('en-US')} color="#4ade80" />
                <Stat label="TOP POST · 30 DAYS" value={top ? top.title_en || top.title_ar : '--'} color="#4ade80" small />
            </div>

            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter posts">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-pressed={filter === f}
                        className={`min-h-[40px] px-4 text-[11px] font-bold tracking-[0.2em] border ${filter === f ? 'border-[#305CDE] bg-[#305CDE]/15 text-white' : 'border-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        {f.toUpperCase()}
                    </button>
                ))}
            </div>

            <ErrorNote>{error}</ErrorNote>

            <div className="border border-slate-800 bg-[#0b0f17] overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-[13px]">
                    <thead>
                        <tr className="text-start text-[10px] tracking-[0.25em] text-slate-400">
                            {['FILE', 'TITLE', 'CATEGORY', 'STATUS', 'DATE', 'VIEWS', 'LAST 7 DAYS'].map((h, i) => (
                                <th key={h} className={`py-4 ${i === 0 ? 'px-5' : 'px-3'} border-b border-slate-800 font-bold text-start`}>{h}</th>
                            ))}
                            <th className="py-4 px-5 border-b border-slate-800 font-bold text-end">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts === null && !error && (
                            <tr><td colSpan="8" className="px-5 py-10 text-slate-500">Loading posts...</td></tr>
                        )}
                        {posts && !shown.length && (
                            <tr><td colSpan="8" className="px-5 py-10 text-slate-500">{rows.length ? 'No posts with this status.' : 'No posts yet. Write the first one.'}</td></tr>
                        )}
                        {shown.map((p) => (
                            <tr key={p.id} className="hover:bg-[#305CDE]/5">
                                <td className="px-5 py-3.5 border-b border-slate-800 text-slate-500">#{String(p.id).padStart(3, '0')}</td>
                                <td className="px-3 py-3.5 border-b border-slate-800 font-sans text-[15px] font-semibold text-slate-200 max-w-[360px]">
                                    {(() => {
                                        const label = p.title_en || (p.title_ar ? <span dir="rtl" className="font-arabic">{p.title_ar}</span> : <span className="text-slate-500">Untitled</span>);
                                        return canEdit(p) ? <Link to={to(`/posts/${p.id}`)} className="hover:text-white">{label}</Link> : label;
                                    })()}
                                    {p.featured && <span className="ms-2 align-middle font-mono text-[9px] tracking-[0.2em] text-[#a8a9ab] border border-slate-700 px-1.5 py-0.5">FEATURED</span>}
                                    <div className="font-mono text-[11px] font-normal text-slate-500 mt-1">{p.author?.display_name}</div>
                                </td>
                                <td className="px-3 py-3.5 border-b border-slate-800 text-[11px] tracking-[0.15em] whitespace-nowrap" style={{ color: CATEGORY_COLOR[p.category] }}>● {CATEGORY_LABEL[p.category]}</td>
                                <td className="px-3 py-3.5 border-b border-slate-800">
                                    <span className="text-[10px] font-bold tracking-[0.2em] px-2 py-1 border" style={{ color: STATE_COLOR[p.state], borderColor: STATE_COLOR[p.state] }}>{p.state.toUpperCase()}</span>
                                </td>
                                <td className="px-3 py-3.5 border-b border-slate-800 text-slate-400">{p.state === 'draft' ? '--' : fmtDate(p.publish_at)}</td>
                                <td className="px-3 py-3.5 border-b border-slate-800 font-sans text-[15px] font-bold text-slate-200">{p.state === 'published' ? Number(p.st?.total ?? 0).toLocaleString('en-US') : '--'}</td>
                                <td className="px-3 py-3.5 border-b border-slate-800"><Bars values={p.st?.last7} /></td>
                                <td className="px-5 py-2.5 border-b border-slate-800">
                                    <div className="flex gap-2 justify-end">
                                        <IconBtn label="Edit post" disabled={!canEdit(p)} onClick={() => navigate(to(`/posts/${p.id}`))}>
                                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                                        </IconBtn>
                                        <IconBtn label={p.state === 'published' ? 'View live post' : 'Not live yet'} disabled={p.state !== 'published'} onClick={() => window.open(publicUrl(p), '_blank', 'noopener')}>
                                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </IconBtn>
                                        <IconBtn label="Delete post" danger disabled={!canEdit(p)} onClick={() => setAsk(p)}>
                                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
                                        </IconBtn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {ask && (
                <ConfirmDelete
                    kicker={`⚠ DELETE POST #${String(ask.id).padStart(3, '0')}`}
                    title={ask.title_en || ask.title_ar || 'Untitled'}
                    text="This post and its view history will be removed from the blog. This cannot be undone."
                    busy={busy}
                    onCancel={() => setAsk(null)}
                    onConfirm={del}
                />
            )}
        </>
    );
}
