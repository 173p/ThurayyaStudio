grant select on public.posts, public.authors to anon, authenticated;
grant insert, update, delete on public.posts, public.authors to authenticated;
grant select on public.post_views_daily to authenticated;
grant usage on all sequences in schema public to authenticated;
