alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.products enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products"
  on public.products
  for select
  to anon, authenticated
  using (is_available = true);

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can create products" on public.products;
create policy "Admins can create products"
  on public.products
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  );

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can create categories" on public.categories;
create policy "Admins can create categories"
  on public.categories for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid()) and profiles.is_admin = true
    )
  );

alter table public.sizes enable row level security;
alter table public.shapes enable row level security;
alter table public.flavors enable row level security;
alter table public.colors enable row level security;

drop policy if exists "Public can read sizes" on public.sizes;
create policy "Public can read sizes" on public.sizes for select to anon, authenticated using (true);
drop policy if exists "Admins can manage sizes" on public.sizes;
create policy "Admins can manage sizes" on public.sizes for all to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true))
  with check (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

drop policy if exists "Public can read shapes" on public.shapes;
create policy "Public can read shapes" on public.shapes for select to anon, authenticated using (true);
drop policy if exists "Admins can manage shapes" on public.shapes;
create policy "Admins can manage shapes" on public.shapes for all to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true))
  with check (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

drop policy if exists "Public can read flavors" on public.flavors;
create policy "Public can read flavors" on public.flavors for select to anon, authenticated using (true);
drop policy if exists "Admins can manage flavors" on public.flavors;
create policy "Admins can manage flavors" on public.flavors for all to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true))
  with check (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

drop policy if exists "Public can read colors" on public.colors;
create policy "Public can read colors" on public.colors for select to anon, authenticated using (true);
drop policy if exists "Admins can manage colors" on public.colors;
create policy "Admins can manage colors" on public.colors for all to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true))
  with check (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

drop policy if exists "Admins can read cake customizations" on public.cake_customizations;
create policy "Admins can read cake customizations"
  on public.cake_customizations for select to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));
