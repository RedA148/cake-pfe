import "server-only";

import { requireAdminUser } from "@/lib/admin-auth";
import type { ColorOption } from "@/lib/cake-options";

function logColorError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Color operation failed", { operation, message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function getAdminColors(): Promise<{ colors: ColorOption[]; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("colors").select("id,name,hex_color").order("name").order("id");
  if (error) {
    logColorError("load_colors", error);
    return { colors: [], error: "Impossible de charger les couleurs." };
  }
  return { colors: data as ColorOption[], error: null };
}

export async function getAdminColor(colorId: number): Promise<{ color: ColorOption | null; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("colors").select("id,name,hex_color").eq("id", colorId).maybeSingle();
  if (error) {
    logColorError("load_color", error);
    return { color: null, error: "Impossible de charger cette couleur." };
  }
  return { color: data as ColorOption | null, error: null };
}
