import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

if (!supabaseConfigured) {
    console.warn('[blog] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing. Create .env.local from .env.example and restart the dev server.');
}

export const supabase = createClient(
    supabaseConfigured ? url : 'https://not-configured.invalid',
    supabaseConfigured ? key : 'not-configured',
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);
