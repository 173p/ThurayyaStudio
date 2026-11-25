import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function serviceKey(): string {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
  return keys.default ?? Object.values(keys)[0];
}

function jwtClaims(token: string): Record<string, unknown> {
  const part = token.split('.')[1] ?? '';
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  return JSON.parse(atob(b64));
}

const BAN_FOREVER = '876000h';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Not signed in' }, 401);
  const { data: me, error: meErr } = await admin.auth.getUser(token);
  if (meErr || !me?.user) return json({ error: 'Not signed in' }, 401);
  const session = String(jwtClaims(token).session_id ?? '');
  const { data: verified } = await admin.rpc('session_is_verified', { p_user: me.user.id, p_session: session || null });
  if (!verified) return json({ error: 'Finish 2-step sign-in first' }, 403);

  const { data: myRow } = await admin.from('authors').select('access_role, active').eq('id', me.user.id).maybeSingle();
  if (!myRow?.active || myRow.access_role !== 'admin') return json({ error: 'Admins only' }, 403);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const { action } = body;

  try {
    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const users = data.users.map((u) => ({
        id: u.id,
        email: u.email,
        confirmed: Boolean(u.email_confirmed_at),
        invited_at: u.invited_at ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
        banned: Boolean(u.banned_until && new Date(u.banned_until) > new Date()),
      }));
      return json({ users });
    }

    if (action === 'invite') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const name = String(body.display_name ?? '').trim();
      const role = body.access_role === 'admin' ? 'admin' : 'editor';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Enter a valid email' }, 400);
      if (!name) return json({ error: 'Enter a display name' }, 400);

      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: body.redirect_to || undefined });
      if (error) {
        if (/already been registered|already exists/i.test(error.message)) return json({ error: 'That email already has an account' }, 409);
        throw error;
      }
      const { error: rowErr } = await admin.from('authors').insert({ id: data.user.id, display_name: name, access_role: role });
      if (rowErr) {
        await admin.auth.admin.deleteUser(data.user.id);
        throw rowErr;
      }
      return json({ ok: true, id: data.user.id });
    }

    const id = String(body.id ?? '');
    if (!id) return json({ error: 'Missing author' }, 400);
    const { data: target, error: tErr } = await admin.auth.admin.getUserById(id);
    if (tErr || !target?.user) return json({ error: 'Author not found' }, 404);

    if (action === 'resend') {
      if (target.user.email_confirmed_at) return json({ error: 'This author has already accepted their invite' }, 409);
      const { error } = await admin.auth.admin.inviteUserByEmail(target.user.email!, { redirectTo: body.redirect_to || undefined });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === 'revoke') {
      if (id === me.user.id) return json({ error: "You can't revoke your own access" }, 400);
      const { data: row } = await admin.from('authors').select('access_role, active').eq('id', id).maybeSingle();
      if (row?.access_role === 'admin' && row.active) {
        const { count } = await admin.from('authors').select('id', { count: 'exact', head: true }).eq('access_role', 'admin').eq('active', true);
        if ((count ?? 0) <= 1) return json({ error: 'At least one admin must keep access' }, 400);
      }
      const { error: e1 } = await admin.from('authors').update({ active: false }).eq('id', id);
      if (e1) throw e1;
      const { error: e2 } = await admin.auth.admin.updateUserById(id, { ban_duration: BAN_FOREVER });
      if (e2) throw e2;
      return json({ ok: true });
    }

    if (action === 'restore') {
      const { error: e1 } = await admin.auth.admin.updateUserById(id, { ban_duration: 'none' });
      if (e1) throw e1;
      const { error: e2 } = await admin.from('authors').update({ active: true }).eq('id', id);
      if (e2) throw e2;
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error(action, e);
    return json({ error: (e as Error).message ?? 'Something went wrong' }, 500);
  }
});
