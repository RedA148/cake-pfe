import "server-only";

import { requireAdminUser } from "@/lib/admin-auth";

export type RecentAdminOrder = {
  id: number;
  status: string;
  total_price: number | string;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export type RecentAdminProduct = {
  id: number;
  name: string;
  base_price: number | string;
  is_available: boolean;
  created_at: string;
  categories: { name: string } | null;
};

export type AdminDashboardData = {
  totalProducts: number;
  availableProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: RecentAdminOrder[];
  recentProducts: RecentAdminProduct[];
};

type SupabaseError = { message: string; code?: string; details?: string; hint?: string };

function logError(operation: string, error: SupabaseError) {
  console.error(operation, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { supabase } = await requireAdminUser();
  const [products, available, categories, customers, orders, pending, revenue, recentOrders, recentProducts] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_available", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("role", "admin"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total_price,status"),
    supabase.from("orders").select("id,status,total_price,created_at,profiles(full_name,email)").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("id,name,base_price,is_available,created_at,categories(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  for (const result of [products, available, categories, customers, orders, pending, revenue, recentOrders, recentProducts]) {
    if (result.error) logError("Unable to load admin dashboard", result.error);
  }

  if ([products, available, categories, customers, orders, pending, revenue, recentOrders, recentProducts].some((result) => result.error)) {
    throw new Error("Impossible de charger le tableau de bord.");
  }

  const revenueRows = (revenue.data ?? []) as Array<{ total_price: number | string; status: string }>;

  return {
    totalProducts: products.count ?? 0,
    availableProducts: available.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalCustomers: customers.count ?? 0,
    totalOrders: orders.count ?? 0,
    pendingOrders: pending.count ?? 0,
    totalRevenue: revenueRows.reduce((sum, order) => order.status === "cancelled" ? sum : sum + Number(order.total_price), 0),
    recentOrders: ((recentOrders.data ?? []) as unknown as Array<Omit<RecentAdminOrder, "profiles"> & { profiles: RecentAdminOrder["profiles"] | RecentAdminOrder["profiles"][] }>).map((order) => ({ ...order, profiles: one(order.profiles) })),
    recentProducts: ((recentProducts.data ?? []) as unknown as Array<Omit<RecentAdminProduct, "categories"> & { categories: RecentAdminProduct["categories"] | RecentAdminProduct["categories"][] }>).map((product) => ({ ...product, categories: one(product.categories) })),
  };
}
