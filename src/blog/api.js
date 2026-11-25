import { supabase, supabaseConfigured } from '../lib/supabase';

function requireConfig() {
    if (!supabaseConfigured) throw new Error('Supabase is not configured (see .env.example).');
}

const LIST_FIELDS = `
  id, slug, category, featured, publish_at, cover_url,
  title_en, title_ar, excerpt_en, excerpt_ar, words_en, words_ar,
  author:authors ( display_name, display_name_ar, role_title, role_title_ar )
`;

export async function listPosts({ limit } = {}) {
    requireConfig();
    let q = supabase.from('posts').select(LIST_FIELDS).order('publish_at', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
}

export async function getPost(slug) {
    requireConfig();
    const { data, error } = await supabase
        .from('posts')
        .select(`
          id, slug, category, publish_at, cover_url, source_name, source_url,
          title_en, title_ar, excerpt_en, excerpt_ar, body_en, body_ar, words_en, words_ar,
          author:authors ( display_name, display_name_ar, role_title, role_title_ar, avatar_url )
        `)
        .eq('slug', slug)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getPreviousPost(publishAt) {
    requireConfig();
    const { data, error } = await supabase
        .from('posts')
        .select('slug, title_en, title_ar')
        .lt('publish_at', publishAt)
        .order('publish_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export function recordView(slug) {
    if (!supabaseConfigured) return;
    try {
        const key = `viewed:${slug}`;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, '1');
    } catch {
        /* ignore */
    }
    supabase.rpc('record_view', { p_slug: slug }).then(() => {}, () => {});
}
