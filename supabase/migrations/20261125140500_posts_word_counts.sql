alter table public.posts
  add column words_en integer generated always as (coalesce(array_length(regexp_split_to_array(nullif(btrim(body_en), ''), '\s+'), 1), 0)) stored,
  add column words_ar integer generated always as (coalesce(array_length(regexp_split_to_array(nullif(btrim(body_ar), ''), '\s+'), 1), 0)) stored;
