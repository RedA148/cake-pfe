import "server-only";
import { requireAdminUser } from "@/lib/admin-auth";
import type { CakeOption, OptionKind } from "@/lib/cake-options";

const optionSelects: Record<OptionKind, string> = {
  sizes: "id, name, price, is_active",
  shapes: "id, name, is_active",
  flavors: "id, name, is_active",
  colors: "id, name, is_active",
};

export async function getAdminOptions(kind: OptionKind): Promise<{
  options: CakeOption[];
  error: string | null;
}> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from(kind)
    .select(optionSelects[kind])
    .order("id");

  if (error) {
    console.error("Unable to load cake options", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { options: [], error: "Impossible de charger les options." };
  }

  return { options: data as unknown as CakeOption[], error: null };
}
