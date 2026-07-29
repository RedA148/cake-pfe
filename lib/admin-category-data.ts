import "server-only";
import { requireAdminUser } from "@/lib/admin-auth";
import type { Category } from "@/lib/categories";

export type AdminCategory = Category & {
  product_count: number;
};

type CategoryCountRow = Category & {
  products?: { count: number }[];
};

function logCategoryError(operation: string, error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  console.error("Category operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function getAdminCategoriesWithCounts(): Promise<{
  categories: AdminCategory[];
  error: string | null;
}> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at, products(count)")
    .order("name");

  if (error) {
    logCategoryError("load_categories_with_product_counts", error);
    return { categories: [], error: "Impossible de charger les catégories." };
  }

  return {
    categories: (data as CategoryCountRow[]).map(({ products, ...category }) => ({
      ...category,
      product_count: products?.[0]?.count ?? 0,
    })),
    error: null,
  };
}

export async function getAdminCategory(categoryId: number): Promise<{
  category: Category | null;
  error: string | null;
}> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    logCategoryError("load_category", error);
    return { category: null, error: "Impossible de charger la catégorie." };
  }

  return { category: data as Category | null, error: null };
}
