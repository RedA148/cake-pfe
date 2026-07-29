create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

alter table public.categories enable row level security;

drop policy if exists "Public can read categories" on public.categories;
drop policy if exists "Admins can create categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;

create policy "Public can read categories"
  on public.categories
  for select
  to anon, authenticated
  using (true);

create policy "Admins can create categories"
  on public.categories
  for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "Admins can update categories"
  on public.categories
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins can delete categories"
  on public.categories
  for delete
  to authenticated
  using (public.current_user_is_admin());

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- The deployed categories table has no updated_at column. Remove only triggers
-- with the conventional updated-at names when that remains true.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'updated_at'
  ) then
    execute 'drop trigger if exists set_categories_updated_at on public.categories';
    execute 'drop trigger if exists update_categories_updated_at on public.categories';
  end if;
end;
$$;
