alter table public.order_items add column if not exists snapshot jsonb;
alter table public.order_items alter column customization_id drop not null;
create unique index if not exists cart_one_per_profile_idx on public.cart (profile_id);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'orders_status_supported') then
    alter table public.orders add constraint orders_status_supported
      check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_payment_supported') then
    alter table public.orders add constraint orders_payment_supported
      check (payment_method in ('cash_on_delivery','card')) not valid;
  end if;
end $$;

alter table public.cart enable row level security;
alter table public.cart_items enable row level security;
alter table public.cake_customizations enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Users manage own cart" on public.cart;
create policy "Users manage own cart" on public.cart for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

drop policy if exists "Users manage own cart items" on public.cart_items;
create policy "Users manage own cart items" on public.cart_items for all to authenticated
  using (exists (select 1 from public.cart where cart.id = cart_items.cart_id and cart.profile_id = (select auth.uid())))
  with check (exists (select 1 from public.cart where cart.id = cart_items.cart_id and cart.profile_id = (select auth.uid())));

drop policy if exists "Users manage own customizations" on public.cake_customizations;
create policy "Users manage own customizations" on public.cake_customizations for all to authenticated
  using (exists (
    select 1 from public.cart_items join public.cart on cart.id = cart_items.cart_id
    where cart_items.id = cake_customizations.cart_item_id and cart.profile_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.cart_items join public.cart on cart.id = cart_items.cart_id
    where cart_items.id = cake_customizations.cart_item_id and cart.profile_id = (select auth.uid())
  ));

drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses" on public.addresses for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select to authenticated
  using (profile_id = (select auth.uid()));
drop policy if exists "Admins read all orders" on public.orders;
create policy "Admins read all orders" on public.orders for select to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true))
  with check (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.profile_id = (select auth.uid())));
drop policy if exists "Admins read all order items" on public.order_items;
create policy "Admins read all order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

create or replace function public.create_order_from_cart(p_address_id bigint, p_payment_method text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_cart_id bigint; v_order_id bigint; v_total numeric := 0; v_count integer := 0; r record;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_payment_method not in ('cash_on_delivery','card') then raise exception 'INVALID_PAYMENT_METHOD'; end if;
  if not exists (select 1 from addresses where id = p_address_id and profile_id = v_user) then raise exception 'INVALID_ADDRESS'; end if;
  select id into v_cart_id from cart where profile_id = v_user;
  if v_cart_id is null then raise exception 'EMPTY_CART'; end if;

  for r in
    select ci.id cart_item_id, ci.product_id, ci.quantity, p.name product_name, p.image_url product_image,
      p.base_price, p.is_available, cc.size_id, cc.shape_id, cc.flavor_id, cc.color_id,
      cc.custom_text, cc.instructions, cc.image_url, s.name size_name, s.price size_price,
      sh.name shape_name, f.name flavor_name, co.name color_name
    from cart_items ci join products p on p.id = ci.product_id
    join cake_customizations cc on cc.cart_item_id = ci.id
    join sizes s on s.id = cc.size_id join shapes sh on sh.id = cc.shape_id
    join flavors f on f.id = cc.flavor_id join colors co on co.id = cc.color_id
    where ci.cart_id = v_cart_id for update of ci
  loop
    if not r.is_available then raise exception 'PRODUCT_UNAVAILABLE:%', r.product_id; end if;
    if r.quantity < 1 then raise exception 'INVALID_QUANTITY'; end if;
    v_count := v_count + 1;
    v_total := v_total + ((r.base_price::numeric + r.size_price::numeric) * r.quantity);
  end loop;
  if v_count = 0 then raise exception 'EMPTY_CART'; end if;

  insert into orders(profile_id,address_id,status,payment_method,total_price)
    values(v_user,p_address_id,'pending',p_payment_method,v_total) returning id into v_order_id;

  insert into order_items(order_id,product_id,customization_id,quantity,price,snapshot)
  select v_order_id, ci.product_id, null, ci.quantity, (p.base_price::numeric + s.price::numeric),
    jsonb_build_object('product_name',p.name,'product_image',p.image_url,'shape',sh.name,'size',s.name,
      'flavor',f.name,'color',co.name,'shape_id',cc.shape_id,'size_id',cc.size_id,'flavor_id',cc.flavor_id,
      'color_id',cc.color_id,'custom_text',cc.custom_text,'instructions',cc.instructions,'image_url',cc.image_url)
  from cart_items ci join products p on p.id=ci.product_id join cake_customizations cc on cc.cart_item_id=ci.id
  join sizes s on s.id=cc.size_id join shapes sh on sh.id=cc.shape_id join flavors f on f.id=cc.flavor_id join colors co on co.id=cc.color_id
  where ci.cart_id=v_cart_id;

  delete from cake_customizations where cart_item_id in (select id from cart_items where cart_id=v_cart_id);
  delete from cart_items where cart_id=v_cart_id;
  return v_order_id;
end $$;

revoke all on function public.create_order_from_cart(bigint,text) from public, anon;
grant execute on function public.create_order_from_cart(bigint,text) to authenticated;
