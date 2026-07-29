import "server-only";

import { requireAdminUser } from "@/lib/admin-auth";
import type { SizeOption } from "@/lib/cake-options";

function logSizeError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Size operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function getAdminSizes(): Promise<{ sizes: SizeOption[]; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("sizes")
    .select("id,name,price")
    .order("price", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    logSizeError("load_sizes", error);
    return { sizes: [], error: "Impossible de charger les tailles." };
  }
  return { sizes: data as SizeOption[], error: null };
}

export async function getAdminSize(sizeId: number): Promise<{ size: SizeOption | null; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("sizes")
    .select("id,name,price")
    .eq("id", sizeId)
    .maybeSingle();

  if (error) {
    logSizeError("load_size", error);
    return { size: null, error: "Impossible de charger cette taille." };
  }
  return { size: data as SizeOption | null, error: null };
}
