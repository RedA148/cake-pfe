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

alter table public.products enable row level security;

drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Public can read available products" on public.products;
drop policy if exists "Admins can read all products" on public.products;
drop policy if exists "Admins can create products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Public can read available products"
  on public.products
  for select
  to anon, authenticated
  using (is_available = true);

create policy "Admins can read all products"
  on public.products
  for select
  to authenticated
  using (public.current_user_is_admin());

create policy "Admins can create products"
  on public.products
  for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.current_user_is_admin());

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- The historical migration attached this trigger to a schema that had updated_at.
-- Remove it only when the deployed products table does not have that column.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'updated_at'
  ) then
    execute 'drop trigger if exists set_products_updated_at on public.products';
    execute 'drop trigger if exists update_products_updated_at on public.products';
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Public can read product images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'products');

create policy "Admins can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'products'
    and public.current_user_is_admin()
  );

create policy "Admins can update product images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'products'
    and public.current_user_is_admin()
  )
  with check (
    bucket_id = 'products'
    and public.current_user_is_admin()
  );

create policy "Admins can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'products'
    and public.current_user_is_admin()
  );
