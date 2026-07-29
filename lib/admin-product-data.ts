import "server-only";
import { requireAdminUser } from "@/lib/admin-auth";
import type { Product, ProductCategory } from "@/lib/product";

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
    id,
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

function logSupabaseError(operation: string, error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  console.error(operation, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function getAdminProducts(): Promise<{
  products: Product[];
  error: string | null;
}> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("Unable to load admin products", error);
    return { products: [], error: "Impossible de charger les produits." };
  }

  return {
    products: (data as ProductQueryRow[]).map(normalizeProduct),
    error: null,
  };
}

export async function getAdminProduct(productId: number): Promise<{
  product: Product | null;
  error: string | null;
}> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("products")
    .select(productColumns)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    logSupabaseError("Unable to load admin product", error);
    return { product: null, error: "Impossible de charger le produit." };
  }

  return {
    product: data ? normalizeProduct(data as ProductQueryRow) : null,
    error: null,
  };
}

export async function getAdminCategories(): Promise<{
  categories: ProductCategory[];
  error: string | null;
}> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    logSupabaseError("Unable to load product categories", error);
    return { categories: [], error: "Impossible de charger les catégories." };
  }

  return { categories: data as ProductCategory[], error: null };
}
