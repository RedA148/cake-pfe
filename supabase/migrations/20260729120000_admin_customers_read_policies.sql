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

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles" on public.profiles for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins read all addresses" on public.addresses;
create policy "Admins read all addresses" on public.addresses for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins read all orders" on public.orders;
create policy "Admins read all orders" on public.orders for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins read all order items" on public.order_items;
create policy "Admins read all order items" on public.order_items for select to authenticated
  using (public.current_user_is_admin());

grant select on public.profiles, public.addresses, public.orders, public.order_items to authenticated;
