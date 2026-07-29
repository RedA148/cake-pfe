import "server-only";
import { createClient } from "@/lib/server";
import type { Category } from "@/lib/categories";

export async function getPublicCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name");

  if (error) {
    console.error("Unable to load categories", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  return data as Category[];
}
