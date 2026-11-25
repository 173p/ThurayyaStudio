create table private.email_codes (
  session_id   uuid primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  code_hash    text not null,
  expires_at   timestamptz not null,
  attempts     integer not null default 0,
  sent_at      timestamptz not null default now(),
  window_start timestamptz not null default now(),
  window_sends integer not null default 1
);

create table private.verified_sessions (
  session_id  uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  verified_at timestamptz not null default now()
);

alter table private.email_codes enable row level security;
alter table private.verified_sessions enable row level security;
revoke all on private.email_codes, private.verified_sessions from public, anon, authenticated;

create or replace function private.has_mfa() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from private.verified_sessions v
    join auth.sessions s on s.id = v.session_id
    where v.session_id = nullif((select auth.jwt()) ->> 'session_id', '')::uuid
      and v.user_id = (select auth.uid())
  );
$$;
revoke all on function private.has_mfa() from public;
grant execute on function private.has_mfa() to anon, authenticated;

create or replace function public.my_session_verified() returns boolean
language sql stable security invoker set search_path = '' as $$
  select private.has_mfa();
$$;
revoke all on function public.my_session_verified() from public, anon;
grant execute on function public.my_session_verified() to authenticated;

create or replace function public.email_code_issue(p_user uuid, p_session uuid, p_hash text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  r private.email_codes;
begin
  delete from private.email_codes where expires_at < now() - interval '1 day';
  delete from private.verified_sessions v where not exists (select 1 from auth.sessions s where s.id = v.session_id);

  select * into r from private.email_codes where session_id = p_session;
  if found then
    if r.sent_at > now() - interval '60 seconds' then return 'wait'; end if;
    if r.window_start > now() - interval '1 hour' and r.window_sends >= 5 then return 'limit'; end if;
    update private.email_codes set
      code_hash = p_hash,
      expires_at = now() + interval '10 minutes',
      attempts = 0,
      sent_at = now(),
      window_start = case when r.window_start > now() - interval '1 hour' then r.window_start else now() end,
      window_sends = case when r.window_start > now() - interval '1 hour' then r.window_sends + 1 else 1 end
    where session_id = p_session;
  else
    insert into private.email_codes (session_id, user_id, code_hash, expires_at)
    values (p_session, p_user, p_hash, now() + interval '10 minutes');
  end if;
  return 'ok';
end;
$$;

create or replace function public.email_code_check(p_user uuid, p_session uuid, p_hash text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  r private.email_codes;
begin
  select * into r from private.email_codes where session_id = p_session and user_id = p_user;
  if not found then return 'none'; end if;
  if r.attempts >= 5 then return 'locked'; end if;
  if r.expires_at < now() then return 'expired'; end if;
  if r.code_hash <> p_hash then
    update private.email_codes set attempts = attempts + 1 where session_id = p_session;
    return case when r.attempts + 1 >= 5 then 'locked' else 'wrong' end;
  end if;
  delete from private.email_codes where session_id = p_session;
  insert into private.verified_sessions (session_id, user_id) values (p_session, p_user)
  on conflict (session_id) do update set verified_at = now();
  return 'ok';
end;
$$;

create or replace function public.session_is_verified(p_user uuid, p_session uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.verified_sessions v join auth.sessions s on s.id = v.session_id
    where v.session_id = p_session and v.user_id = p_user
  );
$$;

revoke all on function public.email_code_issue(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.email_code_check(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.session_is_verified(uuid, uuid) from public, anon, authenticated;
grant execute on function public.email_code_issue(uuid, uuid, text) to service_role;
grant execute on function public.email_code_check(uuid, uuid, text) to service_role;
grant execute on function public.session_is_verified(uuid, uuid) to service_role;
