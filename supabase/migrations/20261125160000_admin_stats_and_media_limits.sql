create or replace function public.post_view_stats()
returns table (post_id bigint, total bigint, last30 bigint, last7 integer[])
language sql stable security invoker set search_path = '' as $$
  with today as (select (now() at time zone 'Asia/Riyadh')::date as d)
  select
    v.post_id,
    sum(v.views)::bigint,
    coalesce(sum(v.views) filter (where v.day > (select d from today) - 30), 0)::bigint,
    array(
      select coalesce((select x.views from public.post_views_daily x where x.post_id = v.post_id and x.day = g::date), 0)
      from generate_series((select d from today) - 6, (select d from today), interval '1 day') g
      order by g
    )
  from public.post_views_daily v
  group by v.post_id;
$$;

revoke all on function public.post_view_stats() from public, anon;
grant execute on function public.post_view_stats() to authenticated;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
where id = 'blog-media';
