import React, { useEffect, useRef, useState } from 'react';
import { sb, adminUrl, emailCode } from './client';
import { Btn, ErrorNote, Spinner } from './ui';

export function AuthFrame({ children }) {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden text-white font-mono"
            style={{
                background:
                    'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0 1px, transparent 2px), radial-gradient(circle at 75% 20%, rgba(255,255,255,0.4) 0 1px, transparent 2px), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.35) 0 1px, transparent 2px), radial-gradient(circle at 10% 85%, rgba(255,255,255,0.3) 0 1px, transparent 2px), #020617',
            }}
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.18) 50%)', backgroundSize: '100% 4px' }} />
            <div className="relative w-full max-w-[440px] bg-[#0b0f17]/95 border border-slate-800 border-t-4 border-t-[#305CDE] shadow-[8px_8px_0_#0d1736]">
                <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-800 text-[11px] font-bold tracking-[0.2em]">
                    <span className="text-[#7B9BF5]">ADMIN PANEL</span>
                    <span className="text-red-400 border border-red-500/35 bg-red-900/20 px-2 py-0.5">RESTRICTED</span>
                </div>
                <div className="px-8 pt-9 pb-8 flex flex-col gap-5">
                    <img src="/logo-transparent-white.png" alt="Thurayya Studio" className="h-[140px] self-center mt-1 mb-2" />
                    {children}
                </div>
            </div>
        </div>
    );
}

const authInput = 'min-h-[48px] bg-slate-950 border border-slate-700 text-white font-mono text-sm px-3.5 focus:border-[#305CDE] focus:outline-none';
const label = 'flex flex-col gap-2 text-[10px] tracking-[0.3em] text-slate-400';

function Heading({ title, text }) {
    return (
        <div className="text-center">
            <h1 className="m-0 font-sans text-[26px] font-extrabold">{title}</h1>
            {text && <p className="mt-2 mb-0 text-xs text-slate-400 leading-relaxed">{text}</p>}
        </div>
    );
}

function CodeInput({ value, onChange }) {
    return (
        <label className={label}>
            ACCESS CODE
            <input
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="000000"
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`${authInput} min-h-[56px] text-[26px] tracking-[0.6em] text-center`}
            />
        </label>
    );
}

export function SignIn({ initialError }) {
    const [step, setStep] = useState('creds');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(initialError || '');

    const signIn = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        setBusy(false);
        if (error) setError(/invalid login/i.test(error.message) ? 'Wrong email or password.' : error.message);
    };

    const sendReset = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: adminUrl('/') });
        setBusy(false);
        if (error && !/rate limit/i.test(error.message)) setError(error.message);
        else if (error) setError('Too many emails were sent. Wait a few minutes and try again.');
        else setStep('sent');
    };

    if (step === 'sent') {
        return (
            <AuthFrame>
                <Heading title="Check your email" text={`If ${email} belongs to a staff account, a reset link is on its way. It expires in 1 hour.`} />
                <Btn variant="quiet" onClick={() => setStep('creds')}>‹ Back to sign in</Btn>
            </AuthFrame>
        );
    }

    if (step === 'reset') {
        return (
            <AuthFrame>
                <form onSubmit={sendReset} className="flex flex-col gap-[18px]">
                    <Heading title="Reset password" text="We'll email a reset link if the address belongs to a staff account." />
                    <label className={label}>
                        EMAIL
                        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@thurayyastudio.com" className={authInput} />
                    </label>
                    <ErrorNote>{error}</ErrorNote>
                    <Btn type="submit" variant="outline" busy={busy} className="min-h-[50px] text-[13px] tracking-[0.25em]">[ SEND RESET LINK ]</Btn>
                    <Btn variant="quiet" onClick={() => { setStep('creds'); setError(''); }}>‹ Back to sign in</Btn>
                </form>
            </AuthFrame>
        );
    }

    return (
        <AuthFrame>
            <form onSubmit={signIn} className="flex flex-col gap-[18px]">
                <label className={label}>
                    EMAIL
                    <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@thurayyastudio.com" className={authInput} />
                </label>
                <label className={label}>
                    PASSWORD
                    <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={authInput} />
                </label>
                <ErrorNote>{error}</ErrorNote>
                <Btn type="submit" variant="primary" busy={busy} className="min-h-[50px] text-[13px] tracking-[0.25em]">[ AUTHENTICATE ]</Btn>
                <Btn variant="quiet" onClick={() => { setStep('reset'); setError(''); }} className="tracking-[0.1em] font-normal">Forgot password?</Btn>
            </form>
        </AuthFrame>
    );
}

const COOLDOWN = 60;

export function TwoFactor({ email, onDone, onSignOut }) {
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [sentTo, setSentTo] = useState('');
    const [wait, setWait] = useState(0);
    const sentOnce = useRef(false);

    const send = async () => {
        setSending(true);
        setError('');
        try {
            const res = await emailCode('send');
            setSentTo(res.email || email);
            setWait(COOLDOWN);
        } catch (e) {
            setError(e.message);
        }
        setSending(false);
    };

    useEffect(() => {
        if (sentOnce.current) return;
        sentOnce.current = true;
        send();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (wait <= 0) return undefined;
        const t = setTimeout(() => setWait((w) => w - 1), 1000);
        return () => clearTimeout(t);
    }, [wait]);

    const verify = async (e) => {
        e.preventDefault();
        if (code.length !== 6) return;
        setBusy(true);
        setError('');
        try {
            const { status } = await emailCode('verify', { code });
            if (status === 'ok') return onDone();
            setCode('');
            setError({
                wrong: "That code isn't right. Check the latest email and try again.",
                expired: 'That code has expired. Send a new one.',
                locked: 'Too many wrong tries. Send a new code.',
                none: 'No code has been sent yet. Send one first.',
            }[status] || 'Something went wrong. Try again.');
        } catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    return (
        <AuthFrame>
            <form onSubmit={verify} className="flex flex-col gap-[18px]">
                <Heading
                    title="Check your email"
                    text={sentTo ? `We sent a 6-digit code to ${sentTo}. It expires in 10 minutes.` : 'Sending a 6-digit sign-in code to your email...'}
                />
                <CodeInput value={code} onChange={setCode} />
                <ErrorNote>{error}</ErrorNote>
                <Btn type="submit" variant="primary" busy={busy} disabled={code.length !== 6} className="min-h-[50px] text-[13px] tracking-[0.25em]">
                    [ ENTER TERMINAL ]
                </Btn>
                <Btn variant="quiet" busy={sending} disabled={wait > 0} onClick={send} className="tracking-[0.1em] font-normal">
                    {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
                </Btn>
                <Btn variant="quiet" onClick={onSignOut}>‹ Back</Btn>
            </form>
        </AuthFrame>
    );
}

export function SetPassword({ invited, onDone, onSignOut }) {
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const save = async (e) => {
        e.preventDefault();
        if (pw !== pw2) return setError("The two passwords don't match.");
        setBusy(true);
        setError('');
        const { error } = await sb.auth.updateUser({ password: pw });
        setBusy(false);
        if (error) setError(/same|different from the old/i.test(error.message) ? 'Pick a password different from your current one.' : error.message);
        else onDone();
    };

    return (
        <AuthFrame>
            <form onSubmit={save} className="flex flex-col gap-[18px]">
                <Heading
                    title={invited ? 'Welcome aboard' : 'Choose a new password'}
                    text={invited ? "Set a password for your staff account. Next we'll email you a sign-in code." : 'Enter a new password for your staff account.'}
                />
                <label className={label}>
                    NEW PASSWORD
                    <input type="password" required minLength={6} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={authInput} />
                </label>
                <label className={label}>
                    CONFIRM PASSWORD
                    <input type="password" required minLength={6} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={authInput} />
                </label>
                <ErrorNote>{error}</ErrorNote>
                <Btn type="submit" variant="primary" busy={busy} className="min-h-[50px] text-[13px] tracking-[0.25em]">[ SAVE PASSWORD ]</Btn>
                <Btn variant="quiet" onClick={onSignOut}>‹ Cancel</Btn>
            </form>
        </AuthFrame>
    );
}

export function NoAccess({ onSignOut }) {
    return (
        <AuthFrame>
            <Heading title="No access" text="This account doesn't have access to the admin panel, or its access was revoked. Ask an admin if you think this is a mistake." />
            <Btn variant="ghost" onClick={onSignOut}>[ SIGN OUT ]</Btn>
        </AuthFrame>
    );
}

export function Loading() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-[#7B9BF5]">
            <Spinner className="w-6 h-6" />
        </div>
    );
}
