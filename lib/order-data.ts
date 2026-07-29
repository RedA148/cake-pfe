import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Address, Order, OrderItem } from "@/lib/commerce";

type OrderRow = Omit<Order, "addresses" | "profiles" | "order_items"> & {
  addresses?: Address | Address[] | null;
  profiles?: Order["profiles"];
  order_items?: OrderItem[];
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalize(row: OrderRow): Order {
  return { ...row, addresses: one(row.addresses), profiles: one(row.profiles), order_items: row.order_items ?? [] };
}

const detailSelect = `id, profile_id, address_id, status, payment_method, total_price, created_at,
  addresses(id, profile_id, full_name, phone, address, city, postal_code, created_at),
  profiles(full_name, email, phone),
  order_items(id, order_id, product_id, customization_id, quantity, price, snapshot)`;

export async function getCustomerOrders(supabase: SupabaseClient, profileId: string): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("id, profile_id, address_id, status, payment_method, total_price, created_at, order_items(id, order_id, product_id, customization_id, quantity, price, snapshot)").eq("profile_id", profileId).order("created_at", { ascending: false });
  if (error) { console.error("Unable to load customer orders", { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw error; }
  return (data as unknown as OrderRow[]).map(normalize);
}

export async function getOrder(supabase: SupabaseClient, orderId: number, profileId?: string): Promise<Order | null> {
  let query = supabase.from("orders").select(detailSelect).eq("id", orderId);
  if (profileId) query = query.eq("profile_id", profileId);
  const { data, error } = await query.maybeSingle();
  if (error) { console.error("Unable to load order", { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw error; }
  return data ? normalize(data as unknown as OrderRow) : null;
}

export async function getAdminOrders(supabase: SupabaseClient): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("id, profile_id, address_id, status, payment_method, total_price, created_at, profiles(full_name,email)").order("created_at", { ascending: false });
  if (error) { console.error("Unable to load admin orders", { message: error.message, code: error.code, details: error.details, hint: error.hint }); throw error; }
  return (data as unknown as OrderRow[]).map(normalize);
}
