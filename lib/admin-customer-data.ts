import "server-only";

import { requireAdminUser } from "@/lib/admin-auth";
import type { Address, OrderStatus, PaymentMethod } from "@/lib/commerce";

export type AdminCustomer = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  orderCount: number;
  totalSpent: number;
};

export type CustomerStats = {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
};

export type CustomerOrderSummary = {
  id: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  total_price: number | string;
  created_at: string;
  itemCount: number;
};

export type AdminCustomerDetail = AdminCustomer & {
  addresses: Address[];
  orders: CustomerOrderSummary[];
  stats: CustomerStats;
};

type SupabaseError = { message: string; code?: string; details?: string; hint?: string };

function logCustomerError(operation: string, error: SupabaseError) {
  console.error("Customer data operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function amount(value: number | string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const { supabase } = await requireAdminUser();
  const [profilesResult, ordersResult] = await Promise.all([
    supabase.from("profiles").select("id,email,full_name,phone,avatar_url,role,created_at,updated_at").neq("role", "admin").order("created_at", { ascending: false }),
    supabase.from("orders").select("profile_id,total_price,status"),
  ]);

  if (profilesResult.error) {
    logCustomerError("load_customers", profilesResult.error);
    throw new Error("Impossible de charger les clients.");
  }
  if (ordersResult.error) {
    logCustomerError("load_customer_totals", ordersResult.error);
    throw new Error("Impossible de charger les commandes des clients.");
  }

  const totals = new Map<string, { count: number; spent: number }>();
  for (const order of ordersResult.data ?? []) {
    const current = totals.get(order.profile_id) ?? { count: 0, spent: 0 };
    current.count += 1;
    if (order.status !== "cancelled") current.spent += amount(order.total_price);
    totals.set(order.profile_id, current);
  }

  return (profilesResult.data ?? []).map((profile) => ({
    ...profile,
    orderCount: totals.get(profile.id)?.count ?? 0,
    totalSpent: totals.get(profile.id)?.spent ?? 0,
  }));
}

export async function getAdminCustomerById(customerId: string): Promise<AdminCustomerDetail | null> {
  const { supabase } = await requireAdminUser();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,avatar_url,role,created_at,updated_at")
    .eq("id", customerId)
    .maybeSingle();

  if (profileError) {
    logCustomerError("load_customer", profileError);
    throw new Error("Impossible de charger ce client.");
  }
  if (!profile || profile.role === "admin") return null;

  const [addressesResult, ordersResult] = await Promise.all([
    supabase.from("addresses").select("id,profile_id,full_name,phone,address,city,postal_code,created_at").eq("profile_id", customerId).order("created_at", { ascending: false }),
    supabase.from("orders").select("id,status,payment_method,total_price,created_at,order_items(id,quantity)").eq("profile_id", customerId).order("created_at", { ascending: false }),
  ]);

  if (addressesResult.error) logCustomerError("load_customer_addresses", addressesResult.error);
  if (ordersResult.error) logCustomerError("load_customer_orders", ordersResult.error);
  if (addressesResult.error || ordersResult.error) throw new Error("Impossible de charger les informations du client.");

  const orders: CustomerOrderSummary[] = (ordersResult.data ?? []).map((order) => ({
    id: order.id,
    status: order.status as OrderStatus,
    payment_method: order.payment_method as PaymentMethod,
    total_price: order.total_price,
    created_at: order.created_at,
    itemCount: (order.order_items ?? []).reduce((sum, item) => sum + item.quantity, 0),
  }));
  const stats: CustomerStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    deliveredOrders: orders.filter((order) => order.status === "delivered").length,
    cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
    totalSpent: orders.reduce((sum, order) => order.status === "cancelled" ? sum : sum + amount(order.total_price), 0),
  };

  return {
    ...profile,
    addresses: (addressesResult.data ?? []) as Address[],
    orders,
    stats,
    orderCount: stats.totalOrders,
    totalSpent: stats.totalSpent,
  };
}

export const getAdminCustomer = getAdminCustomerById;
