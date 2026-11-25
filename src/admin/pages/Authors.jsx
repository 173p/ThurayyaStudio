import React, { useEffect, useState } from 'react';
import { sb, authorsAction, adminUrl, friendlyError } from '../client';
import { uploadImage } from '../media';
import { AuthorAvatar } from '../../blog/components';
import { Btn, ConfirmDelete, ErrorNote, Field, Modal, PageHead, inputCls, timeAgo, useAdmin, useToast } from '../ui';

const STATUS_COLOR = { ACTIVE: '#4ade80', INVITED: '#FFB340', REVOKED: '#94a3b8' };

function EditAuthor({ author, isSelf, onClose, onSaved }) {
    const toast = useToast();
    const [form, setForm] = useState({
        display_name: author.display_name ?? '',
        display_name_ar: author.display_name_ar ?? '',
        role_title: author.role_title ?? '',
        role_title_ar: author.role_title_ar ?? '',
        avatar_url: author.avatar_url ?? '',
        x_url: author.x_url ?? '',
        linkedin_url: author.linkedin_url ?? '',
        github_url: author.github_url ?? '',
        access_role: author.access_role,
    });
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

    const photo = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        try {
            const up = await uploadImage(file, 'avatars');
            setForm((x) => ({ ...x, avatar_url: up.url }));
        } catch (err) {
            toast(err.message, 'error');
        }
        setUploading(false);
    };

    const save = async () => {
        if (!form.display_name.trim()) return setError('Enter a display name.');
        const bad = ['x_url', 'linkedin_url', 'github_url'].find((k) => form[k] && !/^https?:\/\//.test(form[k]));
        if (bad) return setError('Links should start with https://');
        setBusy(true);
        const row = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v]));
        row.display_name = form.display_name.trim();
        if (isSelf) delete row.access_role;
        const { error } = await sb.from('authors').update(row).eq('id', author.id);
        setBusy(false);
        if (error) return setError(friendlyError(error));
        toast('Author saved.');
        onSaved();
    };

    return (
        <Modal label="Edit author" onClose={onClose}>
            <div className="flex justify-between items-center mb-5">
                <div className="text-[11px] tracking-[0.3em] text-[#7B9BF5] font-bold">EDIT AUTHOR</div>
                <span className="text-[10px] tracking-[0.2em] text-slate-400 border border-slate-700 px-2 py-0.5">{author.access_role.toUpperCase()}</span>
            </div>
            <div className="flex gap-4 items-center mb-5">
                <AuthorAvatar src={form.avatar_url} size={64} />
                <label className="min-h-[44px] px-4 inline-flex items-center border border-slate-700 text-slate-300 text-xs font-bold tracking-[0.2em] cursor-pointer hover:border-[#305CDE] hover:text-white">
                    {uploading ? 'UPLOADING...' : '[ CHANGE PHOTO ]'}
                    <input type="file" accept="image/*" className="sr-only" onChange={photo} />
                </label>
                {form.avatar_url && <button type="button" onClick={() => setForm({ ...form, avatar_url: '' })} className="text-[11px] tracking-[0.15em] text-slate-500 hover:text-red-300">REMOVE</button>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Field label="DISPLAY NAME"><input {...f('display_name')} className={inputCls} /></Field>
                <Field label="ARABIC NAME"><input dir="rtl" {...f('display_name_ar')} className={`${inputCls} font-arabic`} /></Field>
                <Field label="ROLE TITLE"><input {...f('role_title')} placeholder="Co-Founder & CEO" className={inputCls} /></Field>
                <Field label="ARABIC TITLE"><input dir="rtl" {...f('role_title_ar')} className={`${inputCls} font-arabic`} /></Field>
                <Field label="X / TWITTER" className="col-span-2"><input {...f('x_url')} placeholder="https://x.com/..." className={inputCls} /></Field>
                <Field label="LINKEDIN" className="col-span-2"><input {...f('linkedin_url')} placeholder="https://linkedin.com/in/..." className={inputCls} /></Field>
                <Field label="GITHUB" className="col-span-2"><input {...f('github_url')} placeholder="https://github.com/..." className={inputCls} /></Field>
                <Field label="ACCESS ROLE" hint={isSelf ? "can't change your own" : undefined} className="col-span-2">
                    <select {...f('access_role')} disabled={isSelf} className={inputCls}>
                        <option value="editor">EDITOR · writes and edits their own posts</option>
                        <option value="admin">ADMIN · manages authors and every post</option>
                    </select>
                </Field>
            </div>
            <p className="my-4 text-[11px] text-slate-500 leading-relaxed">Name, title and photo appear on this author's posts. Arabic versions are used on the Arabic blog.</p>
            <ErrorNote>{error}</ErrorNote>
            <div className="flex gap-3 mt-4">
                <Btn className="flex-1" onClick={onClose}>[ CANCEL ]</Btn>
                <Btn variant="primary" className="flex-1" busy={busy} disabled={uploading} onClick={save}>[ SAVE CHANGES ]</Btn>
            </div>
        </Modal>
    );
}

function InviteAuthor({ onClose, onSent }) {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('editor');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const send = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await authorsAction('invite', { email, display_name: name, access_role: role, redirect_to: adminUrl('/') });
            toast(`Invite sent to ${email.trim()}.`);
            onSent();
        } catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    return (
        <Modal label="Invite author" onClose={onClose}>
            <form onSubmit={send} className="flex flex-col gap-4">
                <div className="text-[11px] tracking-[0.3em] text-[#7B9BF5] font-bold">NEW PERSONNEL FILE</div>
                <p className="font-sans text-xl font-bold m-0">Invite an author</p>
                <Field label="EMAIL"><input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@thurayyastudio.com" className={inputCls} /></Field>
                <Field label="DISPLAY NAME"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Shown on their posts" className={inputCls} /></Field>
                <Field label="ACCESS ROLE">
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                        <option value="editor">EDITOR</option>
                        <option value="admin">ADMIN</option>
                    </select>
                </Field>
                <p className="text-[11px] text-slate-500 leading-relaxed m-0">They'll get an email with a link to set their password. Each sign-in also needs a code sent to their email. If the invite link expires, use RESEND INVITE.</p>
                <ErrorNote>{error}</ErrorNote>
                <div className="flex gap-3 mt-1">
                    <Btn className="flex-1" onClick={onClose}>[ CANCEL ]</Btn>
                    <Btn type="submit" variant="primary" className="flex-1" busy={busy}>[ SEND INVITE ]</Btn>
                </div>
            </form>
        </Modal>
    );
}

export default function Authors() {
    const { me, refreshMe } = useAdmin();
    const toast = useToast();
    const [people, setPeople] = useState(null);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [inviting, setInviting] = useState(false);
    const [revoke, setRevoke] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        const [a, p] = await Promise.all([sb.from('authors').select('*').order('created_at'), sb.from('posts').select('author_id')]);
        if (a.error) return setError(friendlyError(a.error));
        let users = {};
        try {
            const res = await authorsAction('list');
            users = Object.fromEntries(res.users.map((u) => [u.id, u]));
        } catch (e) {
            setError(`Sign-in details could not be loaded: ${e.message}`);
        }
        const counts = {};
        for (const r of p.data ?? []) counts[r.author_id] = (counts[r.author_id] ?? 0) + 1;
        setPeople(a.data.map((x) => {
            const u = users[x.id];
            const status = !x.active ? 'REVOKED' : u && !u.confirmed ? 'INVITED' : 'ACTIVE';
            return { ...x, email: u?.email, last: u?.last_sign_in_at, posts: counts[x.id] ?? 0, status };
        }));
    };

    useEffect(() => { load(); }, []);

    const act = async (action, person, okMsg) => {
        setBusyId(person.id);
        try {
            await authorsAction(action, { id: person.id, redirect_to: adminUrl('/') });
            toast(okMsg);
            setRevoke(null);
            await load();
        } catch (e) {
            toast(e.message, 'error');
        }
        setBusyId(null);
    };

    return (
        <>
            <PageHead kicker="PERSONNEL FILES" title="Authors & Access">
                <Btn variant="primary" className="min-h-[50px] px-6 text-[13px]" onClick={() => setInviting(true)}>[ + INVITE AUTHOR ]</Btn>
            </PageHead>
            <p className="-mt-4 mb-8 text-[13px] text-slate-400 leading-relaxed max-w-2xl">Admins manage authors and can edit or delete any post. Editors write and edit their own posts.</p>
            <ErrorNote>{error}</ErrorNote>

            {people === null ? (
                <p className="text-slate-500 text-sm py-10">Loading authors...</p>
            ) : (
                <div className="grid gap-5 mt-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                    {people.map((p) => {
                        const self = p.id === me.id;
                        return (
                            <div key={p.id} className={`border border-slate-800 bg-[#0b0f17] p-5 flex flex-col gap-4 ${p.status === 'REVOKED' ? 'opacity-60' : ''}`}>
                                <div className="flex justify-between text-[10px] font-bold tracking-[0.2em]">
                                    <span className="px-2 py-0.5 border" style={{ color: p.access_role === 'admin' ? '#f87171' : '#7B9BF5', borderColor: p.access_role === 'admin' ? 'rgba(239,68,68,0.4)' : 'rgba(48,92,222,0.5)' }}>{p.access_role.toUpperCase()}</span>
                                    <span style={{ color: STATUS_COLOR[p.status] }}>● {p.status}</span>
                                </div>
                                <div className="flex gap-3.5 items-center">
                                    <AuthorAvatar src={p.avatar_url} size={56} />
                                    <div className="min-w-0">
                                        <div className="font-sans text-[17px] font-bold truncate">{p.display_name}{self && <span className="font-mono text-[10px] text-slate-500 tracking-[0.2em]"> · YOU</span>}</div>
                                        <div className="text-xs text-slate-400 mt-1 truncate">{p.role_title || '--'}</div>
                                    </div>
                                </div>
                                <div className="text-[11px] text-slate-400 leading-[1.9]">
                                    <div className="flex justify-between gap-3"><span>EMAIL</span><span className="text-slate-300 truncate">{p.email ?? '--'}</span></div>
                                    <div className="flex justify-between"><span>POSTS</span><span className="text-slate-300">{p.posts}</span></div>
                                    <div className="flex justify-between"><span>LAST SIGN-IN</span><span className="text-slate-300">{p.status === 'INVITED' ? 'Never' : timeAgo(p.last)}</span></div>
                                </div>
                                <div className="flex gap-2.5 mt-auto">
                                    <Btn className="flex-1 px-2 text-[11px] tracking-[0.12em]" onClick={() => setEditing(p)}>[ EDIT ]</Btn>
                                    {p.status === 'INVITED' && <Btn variant="outline" className="flex-1 px-2 text-[11px] tracking-[0.12em]" busy={busyId === p.id} onClick={() => act('resend', p, `Invite re-sent to ${p.email}.`)}>[ RESEND ]</Btn>}
                                    {!self && (p.status === 'REVOKED'
                                        ? <Btn variant="outline" className="flex-1 px-2 text-[11px] tracking-[0.12em]" busy={busyId === p.id} onClick={() => act('restore', p, `${p.display_name} can sign in again.`)}>[ RESTORE ]</Btn>
                                        : <Btn variant="danger" className="flex-1 px-2 text-[11px] tracking-[0.12em]" onClick={() => setRevoke(p)}>[ REVOKE ]</Btn>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {editing && (
                <EditAuthor
                    author={editing}
                    isSelf={editing.id === me.id}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); load(); if (editing.id === me.id) refreshMe(); }}
                />
            )}
            {inviting && <InviteAuthor onClose={() => setInviting(false)} onSent={() => { setInviting(false); load(); }} />}
            {revoke && (
                <ConfirmDelete
                    kicker="⚠ REVOKE ACCESS"
                    title={revoke.display_name}
                    text="They will be signed out and can't sign in again until you restore access. Their posts stay on the blog."
                    confirmLabel="[ REVOKE ]"
                    busy={busyId === revoke.id}
                    onCancel={() => setRevoke(null)}
                    onConfirm={() => act('revoke', revoke, `${revoke.display_name} no longer has access.`)}
                />
            )}
        </>
    );
}
