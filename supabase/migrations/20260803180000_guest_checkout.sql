-- Guest orders have no auth profile or saved address. Contact and delivery data
-- are snapshotted directly on the order so administrators can fulfil it.
alter table public.orders alter column profile_id drop not null;
alter table public.orders alter column address_id drop not null;
alter table public.orders add column if not exists guest_full_name text;
alter table public.orders add column if not exists guest_email text;
alter table public.orders add column if not exists guest_phone text;
alter table public.orders add column if not exists guest_address text;

alter table public.orders drop constraint if exists orders_customer_identity;
alter table public.orders add constraint orders_customer_identity check (
  (profile_id is not null and address_id is not null) or
  (profile_id is null and address_id is null and
   nullif(btrim(guest_full_name), '') is not null and
   nullif(btrim(guest_email), '') is not null and
   nullif(btrim(guest_phone), '') is not null and
   nullif(btrim(guest_address), '') is not null)
) not valid;

create or replace function public.create_guest_order(
  p_items jsonb,
  p_full_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_payment_method text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_total numeric := 0;
  v_count integer := 0;
  v_item jsonb;
  v_product_id bigint;
  v_quantity integer;
  v_size_id bigint;
  v_shape_id bigint;
  v_flavor_id bigint;
  v_color_id bigint;
  v_row record;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'INVALID_CART';
  end if;
  if nullif(btrim(p_full_name), '') is null or length(p_full_name) > 160 or
     nullif(btrim(p_email), '') is null or length(p_email) > 320 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or
     nullif(btrim(p_phone), '') is null or length(p_phone) > 50 or
     nullif(btrim(p_address), '') is null or length(p_address) > 1000 then
    raise exception 'INVALID_GUEST';
  end if;
  if p_payment_method not in ('cash_on_delivery', 'card') then raise exception 'INVALID_PAYMENT_METHOD'; end if;

  -- Validate every client-supplied identifier and calculate prices from trusted tables.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item->>'product_id')::bigint;
      v_quantity := (v_item->>'quantity')::integer;
      v_size_id := (v_item->>'size_id')::bigint;
      v_shape_id := (v_item->>'shape_id')::bigint;
      v_flavor_id := (v_item->>'flavor_id')::bigint;
      v_color_id := (v_item->>'color_id')::bigint;
    exception when others then
      raise exception 'INVALID_CART';
    end;
    if v_quantity < 1 or v_quantity > 100 then raise exception 'INVALID_CART'; end if;
    select p.id product_id, p.name product_name, p.image_url product_image, p.base_price, p.is_available,
      s.id size_id, s.name size_name, s.price size_price, sh.id shape_id, sh.name shape_name,
      f.id flavor_id, f.name flavor_name, co.id color_id, co.name color_name
    into v_row from products p cross join sizes s cross join shapes sh cross join flavors f cross join colors co
    where p.id = v_product_id and s.id = v_size_id and sh.id = v_shape_id and f.id = v_flavor_id and co.id = v_color_id;
    if not found then raise exception 'INVALID_CART'; end if;
    if not v_row.is_available then raise exception 'PRODUCT_UNAVAILABLE:%', v_product_id; end if;
    v_total := v_total + ((v_row.base_price::numeric + v_row.size_price::numeric) * v_quantity);
    v_count := v_count + 1;
  end loop;
  if v_count = 0 then raise exception 'INVALID_CART'; end if;

  insert into orders(profile_id, address_id, guest_full_name, guest_email, guest_phone, guest_address, status, payment_method, total_price)
  values(null, null, btrim(p_full_name), lower(btrim(p_email)), btrim(p_phone), btrim(p_address), 'pending', p_payment_method, v_total)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::bigint; v_quantity := (v_item->>'quantity')::integer;
    v_size_id := (v_item->>'size_id')::bigint; v_shape_id := (v_item->>'shape_id')::bigint;
    v_flavor_id := (v_item->>'flavor_id')::bigint; v_color_id := (v_item->>'color_id')::bigint;
    select p.id product_id, p.name product_name, p.image_url product_image, p.base_price,
      s.name size_name, s.price size_price, sh.name shape_name, f.name flavor_name, co.name color_name
    into strict v_row from products p cross join sizes s cross join shapes sh cross join flavors f cross join colors co
    where p.id = v_product_id and s.id = v_size_id and sh.id = v_shape_id and f.id = v_flavor_id and co.id = v_color_id;
    insert into order_items(order_id, product_id, customization_id, quantity, price, snapshot)
    values(v_order_id, v_product_id, null, v_quantity, v_row.base_price::numeric + v_row.size_price::numeric,
      jsonb_build_object('product_name', v_row.product_name, 'product_image', v_row.product_image,
        'shape', v_row.shape_name, 'size', v_row.size_name, 'flavor', v_row.flavor_name, 'color', v_row.color_name,
        'shape_id', v_shape_id, 'size_id', v_size_id, 'flavor_id', v_flavor_id, 'color_id', v_color_id,
        'custom_text', nullif(left(coalesce(v_item->>'custom_text', ''), 500), ''),
        'instructions', nullif(left(coalesce(v_item->>'instructions', ''), 2000), ''),
        'image_url', nullif(left(coalesce(v_item->>'image_url', ''), 1000000), '')));
  end loop;
  return v_order_id;
end;
$$;

revoke all on function public.create_guest_order(jsonb,text,text,text,text,text) from public;
grant execute on function public.create_guest_order(jsonb,text,text,text,text,text) to anon, authenticated;
