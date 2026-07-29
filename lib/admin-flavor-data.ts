import "server-only";

import { requireAdminUser } from "@/lib/admin-auth";
import type { FlavorOption } from "@/lib/cake-options";

function logFlavorError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Flavor operation failed", { operation, message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function getAdminFlavors(): Promise<{ flavors: FlavorOption[]; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("flavors").select("id,name").order("name").order("id");
  if (error) {
    logFlavorError("load_flavors", error);
    return { flavors: [], error: "Impossible de charger les saveurs." };
  }
  return { flavors: data as FlavorOption[], error: null };
}

export async function getAdminFlavor(flavorId: number): Promise<{ flavor: FlavorOption | null; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("flavors").select("id,name").eq("id", flavorId).maybeSingle();
  if (error) {
    logFlavorError("load_flavor", error);
    return { flavor: null, error: "Impossible de charger cette saveur." };
  }
  return { flavor: data as FlavorOption | null, error: null };
}
