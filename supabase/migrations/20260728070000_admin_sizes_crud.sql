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

alter table public.sizes enable row level security;

drop policy if exists "Public can read sizes" on public.sizes;
drop policy if exists "Admins can manage sizes" on public.sizes;
drop policy if exists "Admins can create sizes" on public.sizes;
drop policy if exists "Admins can update sizes" on public.sizes;
drop policy if exists "Admins can delete sizes" on public.sizes;

create policy "Public can read sizes"
  on public.sizes
  for select
  to anon, authenticated
  using (true);

create policy "Admins can create sizes"
  on public.sizes
  for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "Admins can update sizes"
  on public.sizes
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins can delete sizes"
  on public.sizes
  for delete
  to authenticated
  using (public.current_user_is_admin());

grant select on public.sizes to anon, authenticated;
grant insert, update, delete on public.sizes to authenticated;

drop policy if exists "Admins can read cake customizations" on public.cake_customizations;
create policy "Admins can read cake customizations"
  on public.cake_customizations
  for select
  to authenticated
  using (public.current_user_is_admin());
