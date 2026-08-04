import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Address, CakeCustomization, Order, OrderItem, OrderProfile } from "@/lib/commerce";

type ProductRelation = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number | string;
};

type ItemRelation = Omit<OrderItem, "products" | "cake_customizations"> & {
  product: ProductRelation | ProductRelation[] | null;
  customization: CakeCustomization | CakeCustomization[] | null;
};

export type OrderData = Omit<Order, "addresses" | "profiles" | "order_items"> & {
  profile: OrderProfile | OrderProfile[] | null;
  address: Address | Address[] | null;
  items: ItemRelation[] | null;
};

type OrderRow = OrderData;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalize(row: OrderRow): Order {
  const { profile, address, items, ...order } = row;
  return {
    ...order,
    profiles: one(profile),
    addresses: one(address),
    order_items: (items ?? []).map(({ product, customization, ...item }) => ({
      ...item,
      products: one(product),
      cake_customizations: one(customization),
    })),
  };
}

const detailSelect = `id, profile_id, address_id, total_price, payment_method, status, created_at,
  profile:profiles(id, full_name, email, phone, avatar_url),
  address:addresses(id, profile_id, full_name, phone, city, address, postal_code, created_at),
  items:order_items(id, order_id, product_id, customization_id, quantity, price, snapshot,
    product:products(id, name, description, image_url, base_price),
    customization:cake_customizations(id, cart_item_id, shape_id, size_id, flavor_id, color_id, custom_text, instructions, image_url, created_at))`;

export async function getCustomerOrders(supabase: SupabaseClient, profileId: string): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select(`id, profile_id, address_id, status, payment_method, total_price, created_at,
    profile:profiles(id, full_name, email, phone, avatar_url),
    address:addresses(id, profile_id, full_name, phone, city, address, postal_code, created_at),
    items:order_items(id, order_id, product_id, customization_id, quantity, price, snapshot,
      product:products(id, name, description, image_url, base_price),
      customization:cake_customizations(id, cart_item_id, shape_id, size_id, flavor_id, color_id, custom_text, instructions, image_url, created_at))`).eq("profile_id", profileId).order("created_at", { ascending: false });
  if (error) { console.error("Unable to load customer orders", { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw error; }
  return (data as unknown as OrderRow[]).map(normalize);
}

export async function getOrder(supabase: SupabaseClient, orderId: number, profileId?: string): Promise<Order | null> {
  let query = supabase.from("orders").select(detailSelect).eq("id", orderId);
  if (profileId) query = query.eq("profile_id", profileId);
  const { data, error } = await query.maybeSingle();
  if (error) { console.error("Unable to load order", { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw error; }
  console.info("[getOrder] Supabase result", { orderId, profileId, data, error: null });
  return data ? normalize(data as unknown as OrderRow) : null;
}

export async function getAdminOrders(supabase: SupabaseClient): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select(`id, profile_id, address_id, status, payment_method, total_price, created_at,
    profile:profiles(id, full_name, email, phone, avatar_url),
    address:addresses(id, profile_id, full_name, phone, city, address, postal_code, created_at),
    items:order_items(id, order_id, product_id, customization_id, quantity, price, snapshot,
      product:products(id, name, description, image_url, base_price),
      customization:cake_customizations(id, cart_item_id, shape_id, size_id, flavor_id, color_id, custom_text, instructions, image_url, created_at))`).order("created_at", { ascending: false });
  if (error) { console.error("Unable to load admin orders", { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw error; }
  return (data as unknown as OrderRow[]).map(normalize);
}
