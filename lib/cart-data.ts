import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem, CartResult, GuestCartItem } from "@/lib/commerce";

type CartItemRow = {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  products: { id: number; name: string; image_url: string | null; base_price: number | string; is_available: boolean } | { id: number; name: string; image_url: string | null; base_price: number | string; is_available: boolean }[];
  cake_customizations: Array<{
    size_id: number; shape_id: number; flavor_id: number; color_id: number;
    custom_text: string | null; instructions: string | null; image_url: string | null;
    sizes: { name: string; price: number | string } | { name: string; price: number | string }[];
    shapes: { name: string } | { name: string }[];
    flavors: { name: string } | { name: string }[];
    colors: { name: string } | { name: string }[];
  }>;
};

function one<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function logError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error(operation, { message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function getOrCreateCart(supabase: SupabaseClient, profileId: string) {
  const { data: existing, error: readError } = await supabase.from("cart").select("id, profile_id, created_at").eq("profile_id", profileId).maybeSingle();
  if (readError) throw readError;
  if (existing) return existing;
  const { data, error } = await supabase.from("cart").insert({ profile_id: profileId }).select("id, profile_id, created_at").single();
  if (error) throw error;
  return data;
}

export async function getCartItems(supabase: SupabaseClient, profileId: string): Promise<CartItem[]> {
  const { data, error } = await supabase.from("cart_items").select(`
    id, cart_id, product_id, quantity,
    cart!inner(profile_id),
    products(id, name, image_url, base_price, is_available),
    cake_customizations(
      size_id, shape_id, flavor_id, color_id, custom_text, instructions, image_url,
      sizes(name, price), shapes(name), flavors(name), colors(name)
    )
  `).eq("cart.profile_id", profileId).order("created_at");

  if (error) { logError("Unable to load cart items", error); throw error; }

  return (data as unknown as CartItemRow[]).flatMap((row) => {
    const customization = row.cake_customizations[0];
    if (!customization) return [];
    const product = one(row.products);
    const size = one(customization.sizes);
    const unitPrice = Number(product.base_price) + Number(size.price);
    return [{
      id: row.id, cart_id: row.cart_id, productId: product.id, productName: product.name,
      productImage: product.image_url ?? "", isAvailable: product.is_available,
      shape_id: customization.shape_id, size_id: customization.size_id,
      flavor_id: customization.flavor_id, color_id: customization.color_id,
      shape: one(customization.shapes).name, size: size.name,
      flavor: one(customization.flavors).name, color: one(customization.colors).name,
      customText: customization.custom_text ?? "", instructions: customization.instructions ?? "",
      uploadedImage: customization.image_url, quantity: row.quantity,
      unitPrice, totalPrice: unitPrice * row.quantity,
    }];
  });
}

export function calculateCartTotals(items: CartItem[]) {
  return items.reduce((total, item) => total + item.totalPrice, 0);
}

export async function validateGuestItem(supabase: SupabaseClient, item: GuestCartItem): Promise<CartItem | null> {
  if (!Number.isInteger(item.quantity) || item.quantity <= 0) return null;
  const [product, size, shape, flavor, color] = await Promise.all([
    supabase.from("products").select("id, name, image_url, base_price, is_available").eq("id", item.productId).maybeSingle(),
    supabase.from("sizes").select("id, name, price").eq("id", item.size_id).maybeSingle(),
    supabase.from("shapes").select("id, name").eq("id", item.shape_id).maybeSingle(),
    supabase.from("flavors").select("id, name").eq("id", item.flavor_id).maybeSingle(),
    supabase.from("colors").select("id, name").eq("id", item.color_id).maybeSingle(),
  ]);
  const failed = [product, size, shape, flavor, color].find((result) => result.error);
  if (failed?.error) { logError("Unable to validate cart item", failed.error); throw failed.error; }
  if (!product.data || !size.data || !shape.data || !flavor.data || !color.data) return null;
  const unitPrice = Number(product.data.base_price) + Number(size.data.price);
  return {
    ...item, productName: product.data.name, productImage: product.data.image_url ?? "",
    isAvailable: product.data.is_available, size: size.data.name, shape: shape.data.name,
    flavor: flavor.data.name, color: color.data.name, unitPrice, totalPrice: unitPrice * item.quantity,
  };
}

export async function buildCartResult(supabase: SupabaseClient, profileId: string): Promise<CartResult> {
  const items = await getCartItems(supabase, profileId);
  return { authenticated: true, items, total: calculateCartTotals(items), error: null };
}
