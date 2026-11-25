create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.authors a where a.id = (select auth.uid()) and a.active);
$$;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.authors a where a.id = (select auth.uid()) and a.active and a.access_role = 'admin');
$$;

create or replace function private.has_mfa() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2';
$$;

revoke all on function private.is_staff() from public;
revoke all on function private.is_admin() from public;
revoke all on function private.has_mfa() from public;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.has_mfa() to anon, authenticated;

drop policy "authors readable" on public.authors;
drop policy "admins manage authors" on public.authors;
drop policy "read live posts" on public.posts;
drop policy "staff read all posts" on public.posts;
drop policy "staff create posts" on public.posts;
drop policy "staff update posts" on public.posts;
drop policy "staff delete posts" on public.posts;
drop policy "staff read views" on public.post_views_daily;
drop policy "staff list media" on storage.objects;
drop policy "staff upload media" on storage.objects;
drop policy "staff update media" on storage.objects;
drop policy "staff delete media" on storage.objects;

drop function public.is_staff();
drop function public.is_admin();
drop function public.has_mfa();

create policy "authors readable" on public.authors
  for select using (true);
create policy "admins add authors" on public.authors
  for insert to authenticated
  with check ((select private.is_admin()) and (select private.has_mfa()));
create policy "admins edit authors" on public.authors
  for update to authenticated
  using ((select private.is_admin()) and (select private.has_mfa()))
  with check ((select private.is_admin()) and (select private.has_mfa()));
create policy "admins remove authors" on public.authors
  for delete to authenticated
  using ((select private.is_admin()) and (select private.has_mfa()));

create policy "read posts" on public.posts
  for select using ((status <> 'draft' and publish_at <= now()) or (select private.is_staff()));

create policy "staff create posts" on public.posts
  for insert to authenticated
  with check ((select private.has_mfa()) and ((select private.is_admin()) or ((select private.is_staff()) and author_id = (select auth.uid()))));
create policy "staff update posts" on public.posts
  for update to authenticated
  using ((select private.has_mfa()) and ((select private.is_admin()) or ((select private.is_staff()) and author_id = (select auth.uid()))))
  with check ((select private.has_mfa()) and ((select private.is_admin()) or ((select private.is_staff()) and author_id = (select auth.uid()))));
create policy "staff delete posts" on public.posts
  for delete to authenticated
  using ((select private.has_mfa()) and ((select private.is_admin()) or ((select private.is_staff()) and author_id = (select auth.uid()))));

create policy "staff read views" on public.post_views_daily
  for select to authenticated using ((select private.is_staff()));

create policy "staff list media" on storage.objects
  for select to authenticated using (bucket_id = 'blog-media' and (select private.is_staff()));
create policy "staff upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-media' and (select private.is_staff()) and (select private.has_mfa()));
create policy "staff update media" on storage.objects
  for update to authenticated using (bucket_id = 'blog-media' and (select private.is_staff()) and (select private.has_mfa()));
create policy "staff delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-media' and (select private.is_staff()) and (select private.has_mfa()));

create index posts_author_id_idx on public.posts (author_id);
