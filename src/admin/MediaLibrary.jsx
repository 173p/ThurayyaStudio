import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sb } from './client';
import { listMedia, uploadImage, removeMedia } from './media';
import { Btn, ConfirmDelete, ErrorNote, fmtBytes, fmtDate, inputCls, useToast } from './ui';

const QUOTA = 1024 * 1024 * 1024;

export default function MediaLibrary({ onPick, pickLabel = '[ INSERT ]' }) {
    const toast = useToast();
    const [files, setFiles] = useState(null);
    const [usage, setUsage] = useState([]);
    const [sel, setSel] = useState(null);
    const [dims, setDims] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(0);
    const [drag, setDrag] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [query, setQuery] = useState('');
    const input = useRef(null);

    const load = useCallback(async () => {
        try {
            const [list, posts, authors] = await Promise.all([
                listMedia(),
                sb.from('posts').select('id, title_en, title_ar, cover_url, body_en, body_ar'),
                sb.from('authors').select('display_name, avatar_url'),
            ]);
            setFiles(list);
            setUsage([...(posts.data ?? []).map((p) => ({ label: p.title_en || p.title_ar || `Post #${p.id}`, text: `${p.cover_url ?? ''} ${p.body_en} ${p.body_ar}` })), ...(authors.data ?? []).map((a) => ({ label: `${a.display_name} (photo)`, text: a.avatar_url ?? '' }))]);
            setSel((s) => (s ? list.find((f) => f.path === s.path) ?? list[0] ?? null : list[0] ?? null));
        } catch (e) {
            setError(e.message);
            setFiles([]);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        setDims('');
        if (!sel) return;
        const img = new Image();
        img.onload = () => setDims(`${img.naturalWidth} × ${img.naturalHeight}`);
        img.src = sel.url;
    }, [sel]);

    const upload = async (list) => {
        const items = [...list].filter((f) => f.type.startsWith('image/'));
        if (!items.length) return toast('Only images can be uploaded here.', 'error');
        setUploading(items.length);
        let last = null;
        for (const f of items) {
            try {
                last = await uploadImage(f);
            } catch (e) {
                toast(e.message, 'error');
            }
            setUploading((n) => n - 1);
        }
        await load();
        if (last) setSel((s) => ({ ...(s ?? {}), path: last.path, url: last.url, name: last.path, size: last.size }));
        if (last) toast(items.length > 1 ? `${items.length} files uploaded.` : 'File uploaded.');
    };

    const usedIn = useMemo(() => (sel ? usage.filter((u) => u.text.includes(sel.url)).map((u) => u.label) : []), [sel, usage]);
    const used = (files ?? []).reduce((a, f) => a + f.size, 0);
    const shown = (files ?? []).filter((f) => !query || f.name.includes(query.toLowerCase()));

    const del = async () => {
        setBusy(true);
        try {
            await removeMedia(sel.path);
            toast('File deleted.');
            setConfirm(false);
            setSel(null);
            await load();
        } catch (e) {
            toast(e.message, 'error');
        }
        setBusy(false);
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(sel.url);
            toast('URL copied.');
        } catch {
            toast('Copy failed. Select the URL and copy it manually.', 'error');
        }
    };

    return (
        <div className="font-mono">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files..." aria-label="Search files" className={`${inputCls} max-w-xs`} />
                <div className="min-w-[240px]">
                    <div className="flex justify-between text-[10px] tracking-[0.25em] text-slate-400 mb-2">
                        <span>STORAGE</span>
                        <span className="text-slate-300">{fmtBytes(used)} / 1 GB</span>
                    </div>
                    <div className="h-1.5 bg-slate-800"><div className="h-1.5 bg-[#305CDE]" style={{ width: `${Math.max(1, Math.round((used / QUOTA) * 100))}%` }} /></div>
                </div>
            </div>

            <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
                className={`relative flex flex-col items-center justify-center gap-2.5 text-center min-h-[140px] mb-7 border border-dashed cursor-pointer px-4 ${drag ? 'border-[#305CDE] bg-[#305CDE]/10' : 'border-slate-700 bg-[#0b0f17] hover:border-[#305CDE]'}`}
            >
                <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7B9BF5" strokeWidth="1.8"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" /></svg>
                <span className="text-xs font-bold tracking-[0.25em] text-slate-200">{uploading ? `UPLOADING ${uploading}...` : 'DROP FILES OR CLICK TO UPLOAD'}</span>
                <span className="text-[11px] text-slate-400 tracking-[0.08em]">PNG · JPG · WEBP · GIF · images are resized to 1920px and compressed before upload</span>
                <input ref={input} type="file" multiple accept="image/*" className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
            </label>

            <ErrorNote>{error}</ErrorNote>

            <div className="flex flex-wrap gap-6 items-start">
                <div className="flex-[999_1_480px] min-w-0">
                    {files === null ? (
                        <p className="text-slate-500 text-sm py-10">Loading files...</p>
                    ) : !shown.length ? (
                        <p className="text-slate-500 text-sm py-10">{files.length ? 'No files match.' : 'No files yet. Upload an image to get started.'}</p>
                    ) : (
                        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
                            {shown.map((f) => (
                                <button
                                    key={f.path}
                                    type="button"
                                    onClick={() => setSel(f)}
                                    onDoubleClick={() => onPick?.(f)}
                                    aria-label={`Select ${f.name}`}
                                    aria-pressed={sel?.path === f.path}
                                    className={`text-start bg-[#0b0f17] border transition-colors ${sel?.path === f.path ? 'border-[#305CDE] shadow-[4px_4px_0_#142257]' : 'border-slate-800 hover:border-slate-600'}`}
                                >
                                    <div className="h-[120px] bg-black bg-center bg-cover" style={{ backgroundImage: `url("${f.url}")` }} />
                                    <div className="px-3 py-2.5 border-t border-slate-800">
                                        <div className="text-xs text-slate-200 truncate">{f.name}</div>
                                        <div className="text-[10px] text-slate-500 mt-1 tracking-[0.1em]">{fmtBytes(f.size)} · {f.type}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {sel && (
                    <aside className="flex-[1_1_300px] max-w-full bg-[#0b0f17] border border-slate-800 p-5 lg:sticky lg:top-6">
                        <div className="text-[10px] tracking-[0.3em] text-slate-400 mb-3">FILE DETAILS</div>
                        <div className="h-44 bg-black bg-center bg-contain bg-no-repeat border border-slate-800 mb-4" style={{ backgroundImage: `url("${sel.url}")` }} />
                        <div className="text-xs text-slate-400 leading-[2]">
                            <div className="text-sm text-white break-all mb-1">{sel.name}</div>
                            <div className="flex justify-between"><span>DIMENSIONS</span><span className="text-slate-300">{dims || '--'}</span></div>
                            <div className="flex justify-between"><span>SIZE</span><span className="text-slate-300">{fmtBytes(sel.size)}</span></div>
                            <div className="flex justify-between"><span>UPLOADED</span><span className="text-slate-300">{fmtDate(sel.created_at)}</span></div>
                            <div className="flex justify-between gap-4"><span>USED IN</span><span className="text-slate-300 text-end">{usedIn.length ? `${usedIn.length} ${usedIn.length === 1 ? 'place' : 'places'}` : 'Not used'}</span></div>
                        </div>
                        <label className="flex flex-col gap-2 text-[10px] tracking-[0.3em] text-slate-400 mt-4">
                            URL
                            <input readOnly value={sel.url} onFocus={(e) => e.target.select()} className={`${inputCls} text-[11px]`} />
                        </label>
                        <div className="flex gap-2.5 mt-4">
                            <Btn className="flex-1 px-2 text-[11px] tracking-[0.1em]" onClick={copy}>[ COPY URL ]</Btn>
                            {onPick && <Btn variant="primary" className="flex-1 px-2 text-[11px] tracking-[0.1em]" onClick={() => onPick(sel)}>{pickLabel}</Btn>}
                        </div>
                        {!onPick && <Btn variant="danger" className="w-full mt-2.5" onClick={() => setConfirm(true)}>[ DELETE FILE ]</Btn>}
                        {!onPick && usedIn.length > 0 && (
                            <p className="mt-3 text-[11px] leading-relaxed text-amber-300">⚠ Used by {usedIn.slice(0, 2).join(', ')}{usedIn.length > 2 ? ` and ${usedIn.length - 2} more` : ''}. Deleting will leave a broken image there.</p>
                        )}
                    </aside>
                )}
            </div>

            {confirm && (
                <ConfirmDelete
                    kicker="⚠ DELETE FILE"
                    title={sel.name}
                    text={usedIn.length ? 'This file is still used, so those places will show a broken image. This cannot be undone.' : 'This file will be removed from storage. This cannot be undone.'}
                    busy={busy}
                    onCancel={() => setConfirm(false)}
                    onConfirm={del}
                />
            )}
        </div>
    );
}
