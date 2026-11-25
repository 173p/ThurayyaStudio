import React, { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { sb, authLink, adminConfigured } from './client';
import { AdminContext, Layout, NotFound, ToastHost } from './ui';
import { SignIn, TwoFactor, SetPassword, NoAccess, Loading, AuthFrame } from './auth';

const Posts = lazy(() => import('./pages/Posts'));
const Editor = lazy(() => import('./pages/Editor'));
const Media = lazy(() => import('./pages/Media'));
const Authors = lazy(() => import('./pages/Authors'));

const PW_FLAG = 'thurayya-admin-needs-password';
if (authLink.type === 'invite' || authLink.type === 'recovery') {
    try { sessionStorage.setItem(PW_FLAG, authLink.type); } catch { /* ignore */ }
}
const needsPassword = () => { try { return sessionStorage.getItem(PW_FLAG); } catch { return null; } };
const clearPasswordFlag = () => { try { sessionStorage.removeItem(PW_FLAG); } catch { /* ignore */ } };

function linkError(msg) {
    if (!msg) return '';
    if (/expired|invalid/i.test(msg)) return 'That email link has expired or was already used. Sign in, or use "Forgot password?" to get a new one.';
    return msg;
}

export default function AdminApp() {
    const [gate, setGate] = useState({ step: 'loading' });
    const [me, setMe] = useState(null);

    const evaluate = useCallback(async () => {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return setGate({ step: 'signedOut' });

        const pwType = needsPassword();
        if (pwType) return setGate({ step: 'password', invited: pwType === 'invite' });

        const { data: row, error } = await sb.from('authors').select('*').eq('id', session.user.id).maybeSingle();
        if (error) return setGate((g) => (g.step === 'ready' ? g : { step: 'error', message: error.message }));
        if (!row || !row.active) return setGate({ step: 'noAccess' });

        const { data: verified, error: vErr } = await sb.rpc('my_session_verified');
        if (vErr) return setGate((g) => (g.step === 'ready' ? g : { step: 'error', message: vErr.message }));
        if (!verified) return setGate({ step: 'mfa', email: session.user.email });
        setMe(row);
        setGate({ step: 'ready' });
    }, []);

    useEffect(() => {
        document.title = 'Admin | Thurayya Studio';
        let meta = document.head.querySelector('meta[name="robots"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'robots';
            document.head.appendChild(meta);
        }
        meta.content = 'noindex, nofollow';

        evaluate();
        const { data: sub } = sb.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') { setMe(null); setGate({ step: 'signedOut' }); }
            else if (event === 'PASSWORD_RECOVERY') {
                try { sessionStorage.setItem(PW_FLAG, 'recovery'); } catch { /* ignore */ }
                setTimeout(evaluate, 0);
            } else if (event === 'SIGNED_IN') setTimeout(evaluate, 0);
        });
        return () => sub.subscription.unsubscribe();
    }, [evaluate]);

    const signOut = useCallback(async () => {
        clearPasswordFlag();
        await sb.auth.signOut();
    }, []);

    const refreshMe = useCallback(async () => {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return;
        const { data } = await sb.from('authors').select('*').eq('id', session.user.id).maybeSingle();
        if (data) setMe(data);
    }, []);

    if (!adminConfigured) {
        return (
            <AuthFrame>
                <p className="text-center text-sm text-slate-300 leading-relaxed">Supabase isn't configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local and restart the dev server.</p>
            </AuthFrame>
        );
    }

    switch (gate.step) {
        case 'loading': return <Loading />;
        case 'signedOut': return <SignIn initialError={linkError(authLink.error)} />;
        case 'password': return <SetPassword invited={gate.invited} onSignOut={signOut} onDone={() => { clearPasswordFlag(); evaluate(); }} />;
        case 'mfa': return <TwoFactor email={gate.email} onSignOut={signOut} onDone={evaluate} />;
        case 'noAccess': return <NoAccess onSignOut={signOut} />;
        case 'error':
            return (
                <AuthFrame>
                    <p className="text-center text-sm text-slate-300 leading-relaxed">Could not reach the server ({gate.message}). Check your connection.</p>
                    <button onClick={evaluate} className="min-h-[44px] border border-slate-700 text-xs font-bold tracking-[0.2em] hover:border-[#305CDE]">[ TRY AGAIN ]</button>
                </AuthFrame>
            );
        default: break;
    }

    const ctx = { me, isAdmin: me?.access_role === 'admin', signOut, refreshMe };
    return (
        <AdminContext.Provider value={ctx}>
            <ToastHost>
                <Routes>
                    <Route path="posts/new" element={<Suspense fallback={<Loading />}><Editor /></Suspense>} />
                    <Route path="posts/:id" element={<Suspense fallback={<Loading />}><Editor /></Suspense>} />
                    <Route
                        path="*"
                        element={
                            <Layout>
                                <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading...</div>}>
                                    <Routes>
                                        <Route index element={<Posts />} />
                                        <Route path="media" element={<Media />} />
                                        <Route path="authors" element={ctx.isAdmin ? <Authors /> : <NotFound />} />
                                        <Route path="*" element={<NotFound />} />
                                    </Routes>
                                </Suspense>
                            </Layout>
                        }
                    />
                </Routes>
            </ToastHost>
        </AdminContext.Provider>
    );
}
