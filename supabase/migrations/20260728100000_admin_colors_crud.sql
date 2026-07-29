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

alter table public.colors enable row level security;

drop policy if exists "Public can read colors" on public.colors;
drop policy if exists "Admins can manage colors" on public.colors;
drop policy if exists "Admins can create colors" on public.colors;
drop policy if exists "Admins can update colors" on public.colors;
drop policy if exists "Admins can delete colors" on public.colors;

create policy "Public can read colors"
  on public.colors
  for select
  to anon, authenticated
  using (true);

create policy "Admins can create colors"
  on public.colors
  for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "Admins can update colors"
  on public.colors
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins can delete colors"
  on public.colors
  for delete
  to authenticated
  using (public.current_user_is_admin());

grant select on public.colors to anon, authenticated;
grant insert, update, delete on public.colors to authenticated;

drop policy if exists "Admins can read cake customizations" on public.cake_customizations;
create policy "Admins can read cake customizations"
  on public.cake_customizations
  for select
  to authenticated
  using (public.current_user_is_admin());
