import "server-only";
import { createClient } from "@/lib/server";
import type { Product } from "@/lib/product";

export async function getActiveProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      description,
      base_price,
      image_url,
      is_available,
      created_at
    `)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load products", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return [];
  }

  return data as Product[];
}

export async function getFeaturedProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      description,
      base_price,
      image_url,
      is_available,
      created_at
    `)
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Unable to load featured products", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return [];
  }

  return data as Product[];
}
