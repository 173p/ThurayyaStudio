import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const FROM = 'Thurayya Studio <no-reply@mail.thurayyastudio.com>';
const TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Your sign-in code</title>
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
[data-ogsb] .bg-page { background-color: #020617 !important; }
[data-ogsb] .bg-card { background-color: #0b0f17 !important; }
[data-ogsb] .bg-btn { background-color: #305CDE !important; }
[data-ogsb] .bg-code { background-color: #020617 !important; }
[data-ogsc] .c-label { color: #7B9BF5 !important; }
[data-ogsc] .c-head { color: #F1F5F9 !important; }
[data-ogsc] .c-body { color: #A9B6C8 !important; }
[data-ogsc] .c-muted { color: #64748B !important; }
[data-ogsc] .c-white { color: #FFFFFF !important; }
</style>
</head>
<body class="bg-page" style="margin:0; padding:0; background-color:#020617; background-image:linear-gradient(#020617,#020617);">
<table role="presentation" class="bg-page" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#020617" style="background-color:#020617; background-image:linear-gradient(#020617,#020617);">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" class="bg-card" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0f17" style="max-width:560px; background-color:#0b0f17; background-image:linear-gradient(#0b0f17,#0b0f17); border:1px solid #1e293b; border-top:4px solid #305CDE;">
<tr><td align="center" style="padding:32px 36px 8px 36px;">
<img src="https://lihhwggqxzoseboccxqx.supabase.co/functions/v1/email-assets/logo-v3.png" alt="Thurayya Studio" width="112" height="128" style="display:block; margin:0 auto; width:112px; height:128px; border:0;">
</td></tr>
<tr><td align="center" style="padding:20px 36px 0 36px; text-align:center; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace; font-size:12px; font-weight:700; letter-spacing:3px; color:#7B9BF5;" class="c-label">ADMIN PANEL
<tr><td align="center" style="padding:12px 36px 0 36px; text-align:center; font-family:-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:26px; line-height:1.25; font-weight:800; color:#F1F5F9;" class="c-head">Your sign-in code</td></tr>
<tr><td align="center" style="padding:14px 36px 0 36px; text-align:center; font-family:-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:15px; line-height:1.65; color:#A9B6C8;" class="c-body">Enter this code in the admin panel to finish signing in. It expires in 10 minutes.</td></tr>
<tr><td align="center" style="padding:28px 36px 4px 36px;"><table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td class="bg-code c-white" bgcolor="#020617" style="background-color:#020617; background-image:linear-gradient(#020617,#020617); border:1px solid #305CDE; padding:16px 26px; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace; font-size:34px; font-weight:700; letter-spacing:10px; color:#FFFFFF;">{{CODE}}</td></tr></table></td></tr>
<tr><td align="center" style="padding:20px 36px 32px 36px; text-align:center; font-family:-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; line-height:1.6; color:#64748B; border-bottom:1px solid #1e293b;" class="c-muted">If you didn&#8217;t just sign in, someone may know your password. Reset it from the sign-in page and tell an admin.</td></tr>
<tr><td align="center" style="padding:18px 36px 22px 36px; text-align:center; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace; font-size:11px; letter-spacing:2px; color:#64748B;" class="c-muted">&copy; THURAYYA STUDIO &middot; <a href="https://thurayyastudio.com" style="color:#64748B; text-decoration:none;">THURAYYASTUDIO.COM</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

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

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function newCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, '0');
}

function mask(email: string): string {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey(), { auth: { persistSession: false, autoRefreshToken: false } });

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Not signed in' }, 401);
  const { data: me, error: meErr } = await db.auth.getUser(token);
  if (meErr || !me?.user?.email) return json({ error: 'Not signed in' }, 401);
  const session = String(jwtClaims(token).session_id ?? '');
  if (!session) return json({ error: 'Sign in again' }, 401);

  const { data: author } = await db.from('authors').select('active').eq('id', me.user.id).maybeSingle();
  if (!author?.active) return json({ error: 'No access' }, 403);

  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { /* ignore */ }

  try {
    if (body.action === 'send') {
      const code = newCode();
      const { data: status, error } = await db.rpc('email_code_issue', { p_user: me.user.id, p_session: session, p_hash: await sha256(`${session}:${code}`) });
      if (error) throw error;
      if (status === 'wait') return json({ status, email: mask(me.user.email) });
      if (status === 'limit') return json({ error: 'Too many codes were sent. Wait an hour, or sign out and back in.' }, 429);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: [me.user.email],
          subject: `${code} is your Thurayya Studio sign-in code`,
          html: TEMPLATE.replace('{{CODE}}', code),
          text: `Your Thurayya Studio sign-in code is ${code}. It expires in 10 minutes. If you didn't just sign in, reset your password and tell an admin.`,
        }),
      });
      if (!res.ok) {
        console.error('resend', res.status, await res.text());
        return json({ error: 'The code email could not be sent. Try again in a minute.' }, 502);
      }
      return json({ status: 'sent', email: mask(me.user.email) });
    }

    if (body.action === 'verify') {
      const code = String(body.code ?? '').replace(/\D/g, '');
      if (code.length !== 6) return json({ status: 'wrong' });
      const { data: status, error } = await db.rpc('email_code_check', { p_user: me.user.id, p_session: session, p_hash: await sha256(`${session}:${code}`) });
      if (error) throw error;
      return json({ status });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error(body.action, e);
    return json({ error: (e as Error).message ?? 'Something went wrong' }, 500);
  }
});
