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

alter table public.orders enable row level security;

drop policy if exists "Admins read all orders" on public.orders;
drop policy if exists "Admins update orders" on public.orders;

create policy "Admins read all orders"
  on public.orders
  for select
  to authenticated
  using (public.current_user_is_admin());

create policy "Admins update orders"
  on public.orders
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

grant select, update on public.orders to authenticated;
