create type public.post_category as enum ('regional', 'technical', 'studio');
create type public.post_status   as enum ('draft', 'scheduled', 'published');
create type public.author_role   as enum ('admin', 'editor');

create table public.authors (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text not null,
  display_name_ar text,
  role_title     text,
  role_title_ar  text,
  avatar_url     text,
  x_url          text,
  linkedin_url   text,
  github_url     text,
  access_role    public.author_role not null default 'editor',
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table public.posts (
  id          bigint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category    public.post_category not null,
  status      public.post_status not null default 'draft',
  title_en    text not null default '',
  excerpt_en  text not null default '',
  body_en     text not null default '',
  title_ar    text not null default '',
  excerpt_ar  text not null default '',
  body_ar     text not null default '',
  cover_url   text,
  source_name text,
  source_url  text,
  author_id   uuid not null references public.authors (id),
  featured    boolean not null default false,
  publish_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint both_languages_to_publish check (
    status = 'draft'
    or (title_en <> '' and body_en <> '' and title_ar <> '' and body_ar <> '' and publish_at is not null)
  )
);

create index posts_live_idx on public.posts (status, publish_at desc);

create table public.post_views_daily (
  post_id bigint not null references public.posts (id) on delete cascade,
  day     date   not null,
  views   integer not null default 0,
  primary key (post_id, day)
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.authors a where a.id = auth.uid() and a.active);
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.authors a where a.id = auth.uid() and a.active and a.access_role = 'admin');
$$;

create or replace function public.has_mfa() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger posts_touch before update on public.posts
for each row execute function public.touch_updated_at();

create or replace function public.record_view(p_slug text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_id bigint;
begin
  select id into v_id from public.posts
  where slug = p_slug and status <> 'draft' and publish_at <= now();
  if v_id is null then return; end if;
  insert into public.post_views_daily (post_id, day, views)
  values (v_id, (now() at time zone 'Asia/Riyadh')::date, 1)
  on conflict (post_id, day) do update set views = public.post_views_daily.views + 1;
end;
$$;

revoke all on function public.record_view(text) from public;
grant execute on function public.record_view(text) to anon, authenticated;

alter table public.authors          enable row level security;
alter table public.posts            enable row level security;
alter table public.post_views_daily enable row level security;

create policy "authors readable" on public.authors
  for select using (true);
create policy "admins manage authors" on public.authors
  for all to authenticated
  using (public.is_admin() and public.has_mfa())
  with check (public.is_admin() and public.has_mfa());

create policy "read live posts" on public.posts
  for select using (status <> 'draft' and publish_at <= now());
create policy "staff read all posts" on public.posts
  for select to authenticated using (public.is_staff());

create policy "staff create posts" on public.posts
  for insert to authenticated
  with check (public.has_mfa() and (public.is_admin() or (public.is_staff() and author_id = auth.uid())));

create policy "staff update posts" on public.posts
  for update to authenticated
  using (public.has_mfa() and (public.is_admin() or (public.is_staff() and author_id = auth.uid())))
  with check (public.has_mfa() and (public.is_admin() or (public.is_staff() and author_id = auth.uid())));
create policy "staff delete posts" on public.posts
  for delete to authenticated
  using (public.has_mfa() and (public.is_admin() or (public.is_staff() and author_id = auth.uid())));

create policy "staff read views" on public.post_views_daily
  for select to authenticated using (public.is_staff());

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

create policy "staff list media" on storage.objects
  for select to authenticated using (bucket_id = 'blog-media' and public.is_staff());
create policy "staff upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-media' and public.is_staff() and public.has_mfa());
create policy "staff update media" on storage.objects
  for update to authenticated using (bucket_id = 'blog-media' and public.is_staff() and public.has_mfa());
create policy "staff delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-media' and public.is_staff() and public.has_mfa());
