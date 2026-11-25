import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { sb, friendlyError, publicSiteUrl } from '../client';
import { CATEGORIES } from '../../blog/i18n';
import PostArticle from '../../blog/PostArticle';
import MediaLibrary from '../MediaLibrary';
import { Btn, ConfirmDelete, ErrorNote, Field, Modal, inputCls, liveState, STATE_COLOR, CATEGORY_LABEL, to, useAdmin, useToast } from '../ui';

const FIELDS = ['slug', 'category', 'status', 'title_en', 'excerpt_en', 'body_en', 'title_ar', 'excerpt_ar', 'body_ar', 'cover_url', 'source_name', 'source_url', 'author_id', 'featured', 'publish_at'];

const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
const SLUG_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function toLocalInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

function langState(post, lang) {
    const t = post[`title_${lang}`].trim();
    const b = post[`body_${lang}`].trim();
    if (t && b) return { label: 'READY', color: '#4ade80' };
    if (t || b || post[`excerpt_${lang}`].trim()) return { label: 'IN PROGRESS', color: '#FFB340' };
    return { label: 'EMPTY', color: '#64748b' };
}

const ICON = {
    link: <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>,
    image: <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>,
    video: <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="15" height="14" /><path d="M17 10l5-3v10l-5-3" /></svg>,
    note: <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></svg>,
    list: <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>,
};

function ToolBtn({ label, onClick, children, className = '' }) {
    return (
        <button type="button" aria-label={label} title={label} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={`w-10 h-10 flex items-center justify-center border border-slate-700 text-slate-400 hover:text-white hover:border-[#305CDE] ${className}`}>
            {children}
        </button>
    );
}

function UrlModal({ kind, onCancel, onDone }) {
    const [url, setUrl] = useState('https://');
    const [text, setText] = useState('');
    const ok = /^https?:\/\/\S+\.\S+/.test(url);
    return (
        <Modal label={kind === 'video' ? 'Insert video' : 'Insert link'} onClose={onCancel}>
            <form onSubmit={(e) => { e.preventDefault(); if (ok) onDone(url.trim(), text.trim()); }} className="flex flex-col gap-4">
                <div className="text-[11px] tracking-[0.3em] text-[#7B9BF5] font-bold">{kind === 'video' ? 'INSERT VIDEO' : 'INSERT LINK'}</div>
                <Field label="URL" hint={kind === 'video' ? 'YouTube link or .mp4 file' : undefined}>
                    <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} />
                </Field>
                <Field label={kind === 'video' ? 'CAPTION' : 'LINK TEXT'} hint="optional">
                    <input value={text} onChange={(e) => setText(e.target.value)} className={inputCls} />
                </Field>
                <div className="flex gap-3 mt-1">
                    <Btn className="flex-1" onClick={onCancel}>[ CANCEL ]</Btn>
                    <Btn type="submit" variant="primary" className="flex-1" disabled={!ok}>[ INSERT ]</Btn>
                </div>
            </form>
        </Modal>
    );
}

const GUIDE = {
    en: [
        ['Section heading', '## 01 // HOW SHIFTING WORKS'],
        ['Bold', 'Every shift costs **stamina and ammo**.'],
        ['Italic', 'The facility was *never* meant to be found.'],
        ['System note (callout box)', '> Alter the past to change the future.'],
        ['List', '- Three timelines\n- One map\n- No safe rooms'],
        ['Numbered list', '1. Find the key card\n2. Shift to the past\n3. Open the vault'],
        ['Link', 'Wishlist it on [Steam](https://store.steampowered.com/app/3905840/Pexet_Inc/).'],
        ['Image with caption', '![The lab in the future timeline](https://thurayyastudio.com/ingame2.jpg)'],
        ['YouTube video', '![Pexet Inc trailer](https://www.youtube.com/watch?v=VIDEO_ID)'],
        ['Divider', '---'],
    ],
    ar: [
        ['عنوان فرعي', '## 01 // كيف يعمل التنقل'],
        ['نص عريض', 'كل انتقال يكلفك **الطاقة والذخيرة**.'],
        ['نص مائل', 'لم يكن من المفترض *أبدًا* أن يُكتشف المكان.'],
        ['ملاحظة النظام', '> غيّر الماضي لتغيّر المستقبل.'],
        ['قائمة', '- ثلاثة خطوط زمنية\n- خريطة واحدة\n- لا غرف آمنة'],
        ['قائمة مرقمة', '1. ابحث عن البطاقة\n2. انتقل إلى الماضي\n3. افتح الخزنة'],
        ['رابط', 'أضفها لقائمة أمنياتك على [Steam](https://store.steampowered.com/app/3905840/Pexet_Inc/).'],
        ['صورة مع وصف', '![المختبر في الخط الزمني المستقبلي](https://thurayyastudio.com/ingame2.jpg)'],
        ['فيديو يوتيوب', '![إعلان Pexet Inc](https://www.youtube.com/watch?v=VIDEO_ID)'],
        ['فاصل', '---'],
    ],
};

function FormattingGuide({ lang, onInsert, onClose }) {
    const ar = lang === 'ar';
    return (
        <div className="border-b border-slate-800 bg-slate-950/60 p-4">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] tracking-[0.3em] text-[#7B9BF5] font-bold">FORMATTING GUIDE</span>
                <button type="button" onClick={onClose} className="text-[11px] tracking-[0.2em] text-slate-400 hover:text-white min-h-[32px] px-2">[ CLOSE ]</button>
            </div>
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
                {GUIDE[lang].map(([label, md]) => (
                    <button
                        key={label}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onInsert(md.replace(/\\n/g, '\n'))}
                        className="flex flex-col justify-start text-start border border-slate-800 bg-[#0b0f17] px-3 py-2.5 hover:border-[#305CDE] transition-colors"
                    >
                        <div className={`text-[10px] tracking-[0.2em] text-slate-500 mb-1.5 ${ar ? 'font-arabic tracking-normal text-xs' : ''}`}>{label}</div>
                        <pre dir={ar ? 'rtl' : 'ltr'} className={`whitespace-pre-wrap break-words text-[12px] leading-relaxed text-slate-200 m-0 ${ar ? 'font-arabic' : 'font-mono'}`}>{md.replace(/\\n/g, '\n')}</pre>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Writer({ post, lang, set, onPickImage, onAskUrl, onInsert, bodyRef }) {
    const ar = lang === 'ar';
    const [help, setHelp] = useState(false);
    const arFont = ar ? 'font-arabic tracking-normal' : '';

    const edit = (fn) => {
        const el = bodyRef.current;
        if (!el) return;
        const { selectionStart: a, selectionEnd: b, value } = el;
        const { text, selA, selB } = fn(value, a, b);
        set(`body_${lang}`, text);
        requestAnimationFrame(() => { el.focus(); el.setSelectionRange(selA, selB); });
    };
    const wrap = (mark, placeholder) => edit((v, a, b) => {
        const inner = v.slice(a, b) || placeholder;
        return { text: v.slice(0, a) + mark + inner + mark + v.slice(b), selA: a + mark.length, selB: a + mark.length + inner.length };
    });
    const prefix = (mark) => edit((v, a, b) => {
        const start = v.lastIndexOf('\n', a - 1) + 1;
        const lines = v.slice(start, b).split('\n').map((l) => (l.startsWith(mark) ? l : mark + l)).join('\n');
        return { text: v.slice(0, start) + lines + v.slice(b), selA: start + lines.length, selB: start + lines.length };
    });

    return (
        <>
            <Field label={ar ? 'TITLE · ARABIC' : 'TITLE'} className="mb-6">
                <input
                    dir={ar ? 'rtl' : 'ltr'}
                    lang={lang}
                    value={post[`title_${lang}`]}
                    onChange={(e) => set(`title_${lang}`, e.target.value)}
                    placeholder={ar ? 'عنوان المقال' : 'Post title'}
                    className={`w-full bg-transparent border border-slate-800 px-[18px] py-4 text-white text-[32px] font-extrabold font-sans tracking-tight focus:border-[#305CDE] focus:outline-none ${arFont}`}
                />
            </Field>
            <Field label={ar ? 'EXCERPT · ARABIC' : 'EXCERPT'} hint="shown on blog cards" className="mb-6">
                <textarea
                    dir={ar ? 'rtl' : 'ltr'}
                    lang={lang}
                    value={post[`excerpt_${lang}`]}
                    onChange={(e) => set(`excerpt_${lang}`, e.target.value)}
                    placeholder={ar ? 'ملخص قصير للمقال' : 'Short summary of the post'}
                    className={`w-full min-h-[76px] bg-transparent border border-slate-800 px-4 py-3 text-slate-300 text-[15px] tracking-normal leading-relaxed resize-y font-sans focus:border-[#305CDE] focus:outline-none ${arFont}`}
                />
            </Field>
            <div className="border border-slate-800 bg-[#0b0f17]">
                <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-slate-800">
                    <ToolBtn label="Bold" onClick={() => wrap('**', ar ? 'نص عريض' : 'bold text')}><span className="font-extrabold">B</span></ToolBtn>
                    <ToolBtn label="Italic" onClick={() => wrap('*', ar ? 'نص مائل' : 'italic text')}><span className="italic">I</span></ToolBtn>
                    <ToolBtn label="Heading" onClick={() => prefix('## ')}><span className="text-xs font-bold">H2</span></ToolBtn>
                    <ToolBtn label="System note (callout box)" onClick={() => prefix('> ')}>{ICON.note}</ToolBtn>
                    <ToolBtn label="Bulleted list" onClick={() => prefix('- ')}>{ICON.list}</ToolBtn>
                    <ToolBtn label="Insert link" onClick={() => onAskUrl('link')}>{ICON.link}</ToolBtn>
                    <ToolBtn label="Insert image" onClick={onPickImage}>{ICON.image}</ToolBtn>
                    <ToolBtn label="Insert video" onClick={() => onAskUrl('video')}>{ICON.video}</ToolBtn>
                    <button
                        type="button"
                        onClick={() => setHelp((v) => !v)}
                        aria-expanded={help}
                        className={`ms-auto min-h-[40px] px-3 border text-[10px] font-bold tracking-[0.2em] ${help ? 'border-[#305CDE] text-white bg-[#305CDE]/15' : 'border-slate-700 text-slate-400 hover:text-white hover:border-[#305CDE]'}`}
                    >
                        [ FORMATTING HELP ]
                    </button>
                </div>
                {help && <FormattingGuide lang={lang} onInsert={onInsert} onClose={() => setHelp(false)} />}
                <textarea
                    ref={bodyRef}
                    dir={ar ? 'rtl' : 'ltr'}
                    lang={lang}
                    aria-label={ar ? 'Arabic post body' : 'English post body'}
                    value={post[`body_${lang}`]}
                    onChange={(e) => set(`body_${lang}`, e.target.value)}
                    placeholder={ar ? '## 01 // العنوان الفرعي\n\nاكتب المقال هنا.\n\n> ملاحظة اختيارية' : '## 01 // SECTION HEADING\n\nWrite the post here.\n\n> Optional system note'}
                    className={`block w-full min-h-[460px] bg-transparent border-0 p-[22px] text-slate-300 leading-[1.8] resize-y focus:outline-none ${ar ? 'font-arabic text-base' : 'font-mono text-[15px]'}`}
                />
            </div>
            <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                Posts are written in Markdown. Open FORMATTING HELP for examples you can click to add.
            </p>
        </>
    );
}

function Preview({ post, lang, author }) {
    const ar = lang === 'ar';
    const path = `${ar ? '/ar' : ''}/blog/${post.slug || 'your-post-url'}`;
    const view = { ...post, author, words_en: undefined, words_ar: undefined };
    return (
        <div className="border border-slate-800 rounded-md overflow-hidden bg-slate-950">
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#0b0f17] border-b border-slate-800">
                <div aria-hidden="true" className="flex gap-1.5"><span className="w-2.5 h-2.5 bg-slate-700" /><span className="w-2.5 h-2.5 bg-slate-700" /><span className="w-2.5 h-2.5 bg-slate-700" /></div>
                <div className="flex-1 min-w-0 bg-slate-950 border border-slate-800 px-3 py-1.5 text-[11px] text-slate-400 truncate">thurayyastudio.com{path}</div>
            </div>
            <div dir={ar ? 'rtl' : 'ltr'} lang={lang} className={`text-white font-sans pointer-events-auto ${ar ? 'font-arabic' : ''}`}>
                <PostArticle post={view} lang={lang} preview />
            </div>
        </div>
    );
}

const backupKey = (id) => `thurayya-admin-draft:${id ?? 'new'}`;

export default function Editor() {
    const { id } = useParams();
    const isNew = !id;
    const navigate = useNavigate();
    const toast = useToast();
    const { me, isAdmin } = useAdmin();

    const [post, setPost] = useState(null);
    const [saved, setSaved] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [loadError, setLoadError] = useState('');
    const [tab, setTab] = useState('en');
    const [mode, setMode] = useState('write');
    const [picker, setPicker] = useState(null);
    const [urlAsk, setUrlAsk] = useState(null);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [confirmDel, setConfirmDel] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);
    const [backup, setBackup] = useState(null);
    const [conflict, setConflict] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [savedAt, setSavedAt] = useState(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const a = await sb.from('authors').select('id, display_name, display_name_ar, role_title, role_title_ar, avatar_url, active').order('display_name');
            if (alive) setAuthors(a.data ?? []);
            let base;
            if (isNew) {
                base = { slug: '', category: 'studio', status: 'draft', title_en: '', excerpt_en: '', body_en: '', title_ar: '', excerpt_ar: '', body_ar: '', cover_url: null, source_name: '', source_url: '', author_id: me.id, featured: false, publish_at: null };
            } else {
                const { data, error } = await sb.from('posts').select('*').eq('id', id).maybeSingle();
                if (!alive) return;
                if (error || !data) return setLoadError(error ? friendlyError(error) : 'This post no longer exists.');
                base = Object.fromEntries(FIELDS.map((f) => [f, data[f] ?? (f === 'source_name' || f === 'source_url' ? '' : data[f])]));
                base.id = data.id;
                base.updated_at = data.updated_at;
                setSlugTouched(true);
            }
            if (!alive) return;
            setPost(base);
            setSaved(base);
            try {
                const b = JSON.parse(localStorage.getItem(backupKey(id)) || 'null');
                if (b && (!base.updated_at || new Date(b.at) > new Date(base.updated_at)) && FIELDS.some((f) => b.post[f] !== base[f])) setBackup(b);
            } catch { /* ignore */ }
        })();
        return () => { alive = false; };
    }, [id, isNew, me.id, reloadKey]);

    const dirty = useMemo(() => post && saved && FIELDS.some((f) => (post[f] ?? '') !== (saved[f] ?? '')), [post, saved]);

    useEffect(() => {
        if (!dirty) return undefined;
        const t = setTimeout(() => { try { localStorage.setItem(backupKey(id), JSON.stringify({ at: new Date().toISOString(), post })); } catch { /* ignore */ } }, 800);
        const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => { clearTimeout(t); window.removeEventListener('beforeunload', warn); };
    }, [dirty, post, id]);

    const set = useCallback((field, value) => {
        setPost((p) => {
            const next = { ...p, [field]: value };
            if (field === 'title_en' && !slugTouched) next.slug = slugify(value);
            return next;
        });
    }, [slugTouched]);

    const state = post ? liveState(saved ?? post) : 'draft';
    const live = state !== 'draft';
    const scheduledFuture = post?.publish_at && new Date(post.publish_at) > new Date();

    const problems = (publishing) => {
        const list = [];
        if (!SLUG_OK.test(post.slug)) list.push('Add a URL slug (lowercase letters, numbers and dashes).');
        if (publishing) {
            if (!post.title_en.trim() || !post.body_en.trim()) list.push('The English version needs a title and body.');
            if (!post.title_ar.trim() || !post.body_ar.trim()) list.push('The Arabic version needs a title and body.');
        }
        if (post.source_url && !/^https?:\/\//.test(post.source_url)) list.push('The source link should start with https://');
        return list;
    };

    const save = async (target, { force = false } = {}) => {
        const publishing = target === 'live';
        const list = problems(publishing);
        if (list.length) { setError(list.join(' ')); return; }
        setError('');
        setBusy(target);
        const row = Object.fromEntries(FIELDS.map((f) => [f, post[f]]));
        row.source_name = row.source_name?.trim() || null;
        row.source_url = row.source_url?.trim() || null;
        if (publishing) {
            row.publish_at = post.publish_at || new Date().toISOString();
            row.status = new Date(row.publish_at) > new Date() ? 'scheduled' : 'published';
        } else {
            row.status = 'draft';
        }
        let res;
        if (isNew) {
            res = await sb.from('posts').insert(row).select().single();
        } else {
            let q = sb.from('posts').update(row).eq('id', post.id);
            if (!force && saved?.updated_at) q = q.eq('updated_at', saved.updated_at);
            res = await q.select().maybeSingle();
            if (!res.error && !res.data) {
                const { data: latest } = await sb.from('posts').select('updated_at, updated_by').eq('id', post.id).maybeSingle();
                setBusy('');
                if (!latest) { setError('This post was deleted by someone else, so it can no longer be saved. Copy anything you need from it first.'); return; }
                const by = authors.find((a) => a.id === latest.updated_by);
                setConflict({ target, at: latest.updated_at, by: by && by.id !== me.id ? by.display_name : null, self: latest.updated_by === me.id });
                return;
            }
        }
        setBusy('');
        if (res.error) { setError(friendlyError(res.error)); return; }
        const data = res.data;
        const next = Object.fromEntries(FIELDS.map((f) => [f, data[f] ?? (f === 'source_name' || f === 'source_url' ? '' : data[f])]));
        next.id = data.id;
        next.updated_at = data.updated_at;
        try { localStorage.removeItem(backupKey(id)); } catch { /* ignore */ }
        setPost(next);
        setSaved(next);
        setSlugTouched(true);
        setSavedAt(new Date());
        const msg = !publishing ? (live ? 'Moved to drafts. It is no longer on the blog.' : 'Draft saved.')
            : data.status === 'scheduled' ? `Scheduled for ${new Date(data.publish_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.`
            : live ? 'Changes are live.' : 'Published. It is now on the blog.';
        toast(msg);
        if (isNew) navigate(to(`/posts/${data.id}`), { replace: true });
    };

    const saveRef = useRef(null);
    saveRef.current = () => save(live ? 'live' : 'draft');
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveRef.current?.(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const del = async () => {
        setBusy('delete');
        const { error } = await sb.from('posts').delete().eq('id', post.id);
        setBusy('');
        if (error) { toast(friendlyError(error), 'error'); return; }
        try { localStorage.removeItem(backupKey(id)); } catch { /* ignore */ }
        toast('Post deleted.');
        navigate(to('/'), { replace: true });
    };

    const leave = (e) => {
        if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) e.preventDefault();
    };

    const insertAtCursor = (snippet) => {
        const field = `body_${tab}`;
        const el = bodyRef.current;
        const v = post[field];
        const a = el ? el.selectionStart : v.length;
        const b = el ? el.selectionEnd : v.length;
        const before = v.slice(0, a);
        const pad = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
        const text = `${before}${pad}${snippet}\n\n${v.slice(b)}`;
        set(field, text);
        const pos = before.length + pad.length + snippet.length + 2;
        requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(pos, pos); });
    };

    if (loadError) {
        return (
            <div className="min-h-screen bg-slate-950 text-white font-mono flex flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="text-slate-300">{loadError}</p>
                <Link to={to('/')} className="text-[#7B9BF5]">‹ BACK TO POSTS</Link>
            </div>
        );
    }
    if (!post) return <div className="min-h-screen bg-slate-950" />;

    const author = authors.find((a) => a.id === post.author_id) || me;
    const en = langState(post, 'en');
    const ar = langState(post, 'ar');
    const statusLine = isNew && !savedAt ? 'NEW POST' : `EDITING FILE.ID_${String(post.id).padStart(3, '0')}`;
    const saveState = dirty ? 'UNSAVED CHANGES' : savedAt ? `SAVED ${savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : isNew ? '' : 'ALL CHANGES SAVED';
    const publishLabel = live ? '[ SAVE CHANGES ]' : scheduledFuture ? '[ SCHEDULE ]' : '[ PUBLISH ]';
    const tabBtn = (l, label, st) => (
        <button
            type="button"
            onClick={() => setTab(l)}
            aria-pressed={tab === l}
            className={`flex items-center gap-2.5 min-h-[46px] px-[18px] border -mb-px text-xs font-bold tracking-[0.2em] ${tab === l ? 'bg-[#0b0f17] border-slate-800 border-b-[#0b0f17] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            <span className={l === 'ar' ? 'font-arabic tracking-normal text-[15px]' : ''}>{label}</span>
            <span className="text-[9px] tracking-[0.2em]" style={{ color: st.color }}>● {st.label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-mono">
            <header className="sticky top-0 z-30 flex flex-wrap justify-between items-center gap-4 px-5 lg:px-10 py-4 border-b border-slate-800 bg-[#0b0f17]">
                <div className="flex flex-wrap items-center gap-6">
                    <Link to={to('/')} onClick={leave} className="text-xs font-bold tracking-[0.2em] text-slate-300 hover:text-white">‹ ADMIN PANEL</Link>
                    <span className="text-[11px] tracking-[0.2em] text-slate-400">
                        {statusLine} · <span style={{ color: STATE_COLOR[state] }}>● {state.toUpperCase()}</span>
                        {saveState && <> · <span className={dirty ? 'text-amber-300' : ''}>{saveState}</span></>}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    {mode === 'write'
                        ? <Btn onClick={() => setMode('preview')}>[ PREVIEW ]</Btn>
                        : <Btn className="bg-[#305CDE]/15 border-[#305CDE] text-white" onClick={() => setMode('write')}>[ BACK TO WRITE ]</Btn>}
                    {live && post.slug && <Btn onClick={() => window.open(publicSiteUrl(`/blog/${saved.slug}`), '_blank', 'noopener')} disabled={state !== 'published'}>[ VIEW LIVE ]</Btn>}
                    <Btn variant="outline" busy={busy === 'draft'} onClick={() => save('draft')}>{live ? '[ MOVE TO DRAFTS ]' : '[ SAVE DRAFT ]'}</Btn>
                    <Btn variant="primary" busy={busy === 'live'} onClick={() => save('live')}>{publishLabel}</Btn>
                </div>
            </header>

            <div className="max-w-[1360px] mx-auto px-5 lg:px-10 pt-9 pb-16 flex flex-wrap gap-8 items-start">
                <section className="flex-[999_1_600px] min-w-0">
                    {backup && (
                        <div className="mb-6 border border-amber-500/40 bg-amber-900/15 px-4 py-3 text-xs text-amber-200 flex flex-wrap items-center gap-3">
                            <span className="flex-1 min-w-[200px]">Unsaved changes from {new Date(backup.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} were found in this browser.</span>
                            <Btn className="min-h-[36px]" onClick={() => { setPost({ ...post, ...Object.fromEntries(FIELDS.map((f) => [f, backup.post[f]])) }); setBackup(null); }}>[ RESTORE ]</Btn>
                            <Btn variant="quiet" className="min-h-[36px]" onClick={() => { try { localStorage.removeItem(backupKey(id)); } catch { /* ignore */ } setBackup(null); }}>[ DISCARD ]</Btn>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-1 border-b border-slate-800 mb-6">
                        {tabBtn('en', 'ENGLISH', en)}
                        {tabBtn('ar', 'العربية', ar)}
                        <span className="ms-auto self-center text-[11px] text-slate-500">Both versions are needed to publish.</span>
                    </div>

                    {error && <div className="mb-5"><ErrorNote>{error}</ErrorNote></div>}

                    {mode === 'write'
                        ? <Writer post={post} lang={tab} set={set} bodyRef={bodyRef} onPickImage={() => setPicker('body')} onAskUrl={setUrlAsk} onInsert={insertAtCursor} />
                        : <Preview post={post} lang={tab} author={author} />}
                </section>

                <aside className="flex-[1_1_320px] flex flex-col gap-5">
                    <div className="border border-slate-800 bg-[#0b0f17] p-5">
                        <div className="text-[10px] tracking-[0.3em] text-slate-400 mb-3">COVER IMAGE</div>
                        {post.cover_url
                            ? <div className="h-40 bg-black bg-center bg-cover border border-slate-800 mb-3" style={{ backgroundImage: `url("${post.cover_url}")` }} />
                            : <div className="h-40 border border-slate-800 mb-3 flex items-center justify-center text-[10px] tracking-[0.25em] text-slate-600" style={{ background: 'repeating-linear-gradient(0deg, #0b0f17 0 2px, #111827 2px 4px)' }}>[ NO COVER ]</div>}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setPicker('cover')} className="flex-1 min-h-[44px] border border-dashed border-slate-700 text-slate-400 text-[11px] tracking-[0.2em] hover:text-white hover:border-[#305CDE]">
                                {post.cover_url ? '[ REPLACE IMAGE ]' : '[ CHOOSE IMAGE ]'}
                            </button>
                            {post.cover_url && <button type="button" onClick={() => set('cover_url', null)} className="min-h-[44px] px-3 border border-slate-700 text-slate-400 text-[11px] tracking-[0.2em] hover:text-red-300 hover:border-red-500">[ REMOVE ]</button>}
                        </div>
                    </div>

                    <div className="border border-slate-800 bg-[#0b0f17] p-5 flex flex-col gap-4">
                        <Field label="CATEGORY">
                            <select value={post.category} onChange={(e) => set('category', e.target.value)} className={`${inputCls} tracking-[0.1em]`}>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                            </select>
                        </Field>
                        <Field label="URL SLUG" hint={live ? 'changing it breaks old links' : 'from the English title'}>
                            <input value={post.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }} onBlur={() => set('slug', slugify(post.slug))} className={inputCls} />
                        </Field>
                        <Field label="AUTHOR">
                            <select value={post.author_id} disabled={!isAdmin} onChange={(e) => set('author_id', e.target.value)} className={inputCls}>
                                {(authors.length ? authors : [me]).filter((a) => a.active || a.id === post.author_id).map((a) => <option key={a.id} value={a.id}>{a.display_name}</option>)}
                            </select>
                        </Field>
                        <Field label="PUBLISH ON" hint="optional, leave empty for now">
                            <input type="datetime-local" value={toLocalInput(post.publish_at)} onChange={(e) => set('publish_at', fromLocalInput(e.target.value))} className={`${inputCls} [color-scheme:dark]`} />
                        </Field>
                        {scheduledFuture && <p className="-mt-2 text-[11px] text-[#C77DFF] leading-relaxed">Goes live automatically at this time once you press SCHEDULE.</p>}
                        <Field label="SOURCE NAME" hint="for news from other outlets">
                            <input value={post.source_name} onChange={(e) => set('source_name', e.target.value)} placeholder="e.g. Saudi Esports Federation" className={inputCls} />
                        </Field>
                        <Field label="SOURCE LINK">
                            <input value={post.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="https://..." className={inputCls} />
                        </Field>
                        <label className="flex items-center gap-2.5 text-[11px] tracking-[0.15em] text-slate-300 min-h-[44px] cursor-pointer">
                            <input type="checkbox" checked={post.featured} onChange={(e) => set('featured', e.target.checked)} className="w-[18px] h-[18px] accent-[#305CDE]" />
                            FEATURE ON BLOG PAGE
                        </label>
                    </div>

                    {!isNew && (
                        <div className="border border-red-900 bg-red-900/10 p-5">
                            <div className="text-[10px] tracking-[0.3em] text-red-400 mb-3">DANGER ZONE</div>
                            <Btn variant="danger" className="w-full" onClick={() => setConfirmDel(true)}>[ DELETE THIS POST ]</Btn>
                        </div>
                    )}
                </aside>
            </div>

            {picker && (
                <Modal label="Choose an image" wide onClose={() => setPicker(null)}>
                    <div className="flex justify-between items-center mb-5">
                        <div className="text-[11px] tracking-[0.3em] text-[#7B9BF5] font-bold">{picker === 'cover' ? 'CHOOSE COVER IMAGE' : 'INSERT IMAGE'}</div>
                        <Btn variant="quiet" onClick={() => setPicker(null)}>[ CLOSE ]</Btn>
                    </div>
                    <MediaLibrary
                        pickLabel={picker === 'cover' ? '[ USE AS COVER ]' : '[ INSERT ]'}
                        onPick={(f) => {
                            if (picker === 'cover') set('cover_url', f.url);
                            else insertAtCursor(`![${tab === 'ar' ? 'وصف الصورة' : 'Image caption'}](${f.url})`);
                            setPicker(null);
                            if (mode !== 'write' && picker === 'body') setMode('write');
                        }}
                    />
                </Modal>
            )}

            {urlAsk && (
                <UrlModal
                    kind={urlAsk}
                    onCancel={() => setUrlAsk(null)}
                    onDone={(url, text) => {
                        if (urlAsk === 'video') {
                            insertAtCursor(`![${text || 'Video'}](${url})`);
                        } else {
                            const el = bodyRef.current;
                            const field = `body_${tab}`;
                            const v = post[field];
                            const a = el ? el.selectionStart : v.length;
                            const b = el ? el.selectionEnd : v.length;
                            const label = text || v.slice(a, b) || url;
                            set(field, `${v.slice(0, a)}[${label}](${url})${v.slice(b)}`);
                        }
                        setUrlAsk(null);
                    }}
                />
            )}

            {conflict && (
                <Modal label="Someone else saved this post" onClose={() => setConflict(null)}>
                    <div className="text-[11px] tracking-[0.3em] text-amber-300 font-bold mb-3.5">EDIT CONFLICT</div>
                    <p className="font-sans text-xl font-bold leading-snug mb-2 text-white">
                        {conflict.self ? 'You saved this post in another tab' : `${conflict.by || 'Another author'} saved this post`}
                    </p>
                    <p className="text-slate-400 text-[13px] leading-relaxed mb-6">
                        Their changes were saved at {new Date(conflict.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}, after you opened this page.
                        Saving now would replace their version with yours.
                    </p>
                    <div className="flex flex-col gap-2.5">
                        <Btn
                            variant="outline"
                            onClick={() => {
                                const mine = post;
                                setConflict(null);
                                setPost(null);
                                setReloadKey((k) => k + 1);
                                setTimeout(() => setBackup({ at: new Date().toISOString(), post: mine }), 0);
                            }}
                        >
                            [ LOAD THEIR VERSION ]
                        </Btn>
                        <Btn variant="danger" onClick={() => { const t = conflict.target; setConflict(null); save(t, { force: true }); }}>[ SAVE MINE ANYWAY ]</Btn>
                        <Btn variant="quiet" onClick={() => setConflict(null)}>[ CANCEL ]</Btn>
                    </div>
                    <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">If you load their version, your changes stay available in the RESTORE bar at the top of the editor.</p>
                </Modal>
            )}

            {confirmDel && (
                <ConfirmDelete
                    kicker={`⚠ DELETE POST #${String(post.id).padStart(3, '0')}`}
                    title={post.title_en || post.title_ar || 'Untitled'}
                    text="This post and its view history will be removed from the blog. This cannot be undone."
                    busy={busy === 'delete'}
                    onCancel={() => setConfirmDel(false)}
                    onConfirm={del}
                />
            )}
        </div>
    );
}
