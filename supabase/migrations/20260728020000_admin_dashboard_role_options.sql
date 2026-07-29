alter table public.profiles
  add column if not exists role text not null default 'customer';

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_admin'
  ) then
    execute 'update public.profiles set role = ''admin'' where is_admin = true';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_supported') then
    alter table public.profiles add constraint profiles_role_supported
      check (role in ('customer', 'admin'));
  end if;
end $$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

-- A customer may edit their public profile fields, never their role.
revoke update on public.profiles from authenticated;
grant update (email, full_name, phone, avatar_url, updated_at) on public.profiles to authenticated;
revoke insert on public.profiles from authenticated;
grant insert (id, email, full_name, phone, avatar_url, updated_at) on public.profiles to authenticated;

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles" on public.profiles for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products" on public.products for select to authenticated
  using (public.current_user_is_admin());
drop policy if exists "Admins can create products" on public.products;
create policy "Admins can create products" on public.products for insert to authenticated
  with check (public.current_user_is_admin());
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins can create categories" on public.categories;
create policy "Admins can create categories" on public.categories for insert to authenticated
  with check (public.current_user_is_admin());
drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories" on public.categories for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());
drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories" on public.categories for delete to authenticated
  using (public.current_user_is_admin());

alter table public.sizes add column if not exists is_active boolean not null default true;
alter table public.shapes add column if not exists is_active boolean not null default true;
alter table public.flavors add column if not exists is_active boolean not null default true;
alter table public.colors add column if not exists is_active boolean not null default true;

drop policy if exists "Public can read sizes" on public.sizes;
create policy "Public can read sizes" on public.sizes for select to anon, authenticated
  using (is_active = true);
drop policy if exists "Admins can manage sizes" on public.sizes;
create policy "Admins can manage sizes" on public.sizes for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Public can read shapes" on public.shapes;
create policy "Public can read shapes" on public.shapes for select to anon, authenticated
  using (is_active = true);
drop policy if exists "Admins can manage shapes" on public.shapes;
create policy "Admins can manage shapes" on public.shapes for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Public can read flavors" on public.flavors;
create policy "Public can read flavors" on public.flavors for select to anon, authenticated
  using (is_active = true);
drop policy if exists "Admins can manage flavors" on public.flavors;
create policy "Admins can manage flavors" on public.flavors for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Public can read colors" on public.colors;
create policy "Public can read colors" on public.colors for select to anon, authenticated
  using (is_active = true);
drop policy if exists "Admins can manage colors" on public.colors;
create policy "Admins can manage colors" on public.colors for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Admins can read cake customizations" on public.cake_customizations;
create policy "Admins can read cake customizations" on public.cake_customizations for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins read all orders" on public.orders;
create policy "Admins read all orders" on public.orders for select to authenticated
  using (public.current_user_is_admin());
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());
drop policy if exists "Admins read all order items" on public.order_items;
create policy "Admins read all order items" on public.order_items for select to authenticated
  using (public.current_user_is_admin());

drop policy if exists "Admins read all addresses" on public.addresses;
create policy "Admins read all addresses" on public.addresses for select to authenticated
  using (public.current_user_is_admin());
