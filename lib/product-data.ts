import "server-only";
import { createClient } from "@/lib/server";
import type { Product } from "@/lib/product";

type ProductQueryRow = Omit<Product, "categories"> & {
  categories?: Product["categories"] | NonNullable<Product["categories"]>[];
};

const productColumns = `
  id,
  category_id,
  name,
  description,
  base_price,
  image_url,
  is_available,
  created_at,
  categories (
    name
  )
`;

function normalizeProduct(row: ProductQueryRow): Product {
  return {
    ...row,
    categories: Array.isArray(row.categories)
      ? row.categories[0] ?? null
      : row.categories ?? null,
  };
}

export async function getActiveProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
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

  return (data as ProductQueryRow[]).map(normalizeProduct);
}

export async function getFeaturedProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
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

  return (data as ProductQueryRow[]).map(normalizeProduct);
}
