import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const adminConfigured = Boolean(url && key);

export const isAdminHost = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
export const ADMIN_BASE = isAdminHost ? '' : '/admin';
export const adminUrl = (path = '') => `${window.location.origin}${ADMIN_BASE}${path}`;
export const publicSiteUrl = (path = '') => `${isAdminHost ? 'https://thurayyastudio.com' : window.location.origin}${path}`;

function readAuthLink() {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const q = new URLSearchParams(window.location.search);
    return {
        type: h.get('type') || q.get('type') || null,
        error: h.get('error_description') || q.get('error_description') || null,
    };
}
export const authLink = typeof window !== 'undefined' ? readAuthLink() : { type: null, error: null };

export const sb = createClient(
    adminConfigured ? url : 'https://not-configured.invalid',
    adminConfigured ? key : 'not-configured',
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'thurayya-admin' } },
);

export async function authorsAction(action, payload = {}) {
    const { data, error } = await sb.functions.invoke('admin-authors', { body: { action, ...payload } });
    if (error) {
        let msg = error.message;
        try {
            const body = await error.context?.json?.();
            if (body?.error) msg = body.error;
        } catch {
            /* ignore */
        }
        throw new Error(msg);
    }
    return data;
}

export async function emailCode(action, payload = {}) {
    const { data, error } = await sb.functions.invoke('email-2fa', { body: { action, ...payload } });
    if (error) {
        let msg = error.message;
        try {
            const body = await error.context?.json?.();
            if (body?.error) msg = body.error;
        } catch {
            /* ignore */
        }
        throw new Error(msg);
    }
    return data;
}

export const MEDIA_BUCKET = 'blog-media';
export const publicMediaUrl = (path) => sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

export function friendlyError(e) {
    const m = String(e?.message || e || 'Something went wrong');
    if (/both_languages_to_publish/.test(m)) return 'Both the English and Arabic versions need a title and body before this can go live.';
    if (/posts_slug_key|duplicate key.*slug/.test(m)) return 'Another post already uses this URL slug. Pick a different one.';
    if (/posts_slug_check|violates check constraint "posts_slug/.test(m)) return 'The URL slug can only use lowercase letters, numbers and single dashes.';
    if (/row-level security|permission denied/i.test(m)) return "You don't have permission to do that. Sign out and back in, then try again.";
    if (/Failed to fetch|NetworkError/i.test(m)) return 'Could not reach the server. Check your connection and try again.';
    return m;
}
