alter table public.posts add column updated_by uuid;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce((select auth.uid()), new.updated_by);
  return new;
end;
$$;

create or replace function public.set_updated_by_on_insert() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_by := coalesce((select auth.uid()), new.updated_by);
  return new;
end;
$$;

create trigger posts_set_updated_by before insert on public.posts
for each row execute function public.set_updated_by_on_insert();
