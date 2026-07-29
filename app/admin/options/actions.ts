"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import type { OptionKind } from "@/lib/cake-options";

export type OptionMutationResult = {
  success: boolean;
  message: string;
};

const customizationColumns: Record<OptionKind, string> = {
  sizes: "size_id",
  shapes: "shape_id",
  flavors: "flavor_id",
  colors: "color_id",
};

function isOptionKind(value: string): value is OptionKind {
  return ["sizes", "shapes", "flavors", "colors"].includes(value);
}

function logError(operation: string, error: {
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

function validateInput(kind: OptionKind, input: { name: string; price?: number; is_active: boolean }) {
  const name = input.name.trim();
  if (!name) return { error: "Le nom est obligatoire.", data: null };

  if (kind === "sizes") {
    const price = Number(input.price);
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Le prix supplémentaire doit être positif ou nul.", data: null };
    }
    return { error: null, data: { name, price, is_active: input.is_active } };
  }

  return { error: null, data: { name, is_active: input.is_active } };
}

export async function createOption(
  kindValue: string,
  input: { name: string; price?: number; is_active: boolean },
): Promise<OptionMutationResult> {
  if (!isOptionKind(kindValue)) return { success: false, message: "Type d’option invalide." };
  const validation = validateInput(kindValue, input);
  if (!validation.data) return { success: false, message: validation.error };

  const { supabase } = await requireAdminUser();
  const { error } = await supabase.from(kindValue).insert(validation.data as never);
  if (error) {
    logError("Unable to create cake option", error);
    return {
      success: false,
      message: error.code === "23505" ? "Cette option existe déjà." : "Impossible de créer l’option.",
    };
  }

  revalidatePath(`/admin/options/${kindValue}`);
  revalidatePath("/customize/[id]", "page");
  return { success: true, message: "Option créée avec succès." };
}

export async function updateOption(
  kindValue: string,
  optionId: number,
  input: { name: string; price?: number; is_active: boolean },
): Promise<OptionMutationResult> {
  if (!isOptionKind(kindValue) || !Number.isInteger(optionId) || optionId <= 0) {
    return { success: false, message: "Option invalide." };
  }
  const validation = validateInput(kindValue, input);
  if (!validation.data) return { success: false, message: validation.error };

  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from(kindValue)
    .update(validation.data as never)
    .eq("id", optionId)
    .select("id")
    .maybeSingle();

  if (error) {
    logError("Unable to update cake option", error);
    return {
      success: false,
      message: error.code === "23505" ? "Cette option existe déjà." : "Impossible de modifier l’option.",
    };
  }
  if (!data) return { success: false, message: "Option introuvable." };

  revalidatePath(`/admin/options/${kindValue}`);
  revalidatePath("/customize/[id]", "page");
  return { success: true, message: "Option modifiée avec succès." };
}

export async function deleteOption(
  kindValue: string,
  optionId: number,
): Promise<OptionMutationResult> {
  if (!isOptionKind(kindValue) || !Number.isInteger(optionId) || optionId <= 0) {
    return { success: false, message: "Option invalide." };
  }

  const { supabase } = await requireAdminUser();
  const { count, error: countError } = await supabase
    .from("cake_customizations")
    .select("id", { count: "exact", head: true })
    .eq(customizationColumns[kindValue], optionId);

  if (countError) {
    logError("Unable to check cake option usage", countError);
    return { success: false, message: "Impossible de vérifier l’utilisation de cette option." };
  }
  if ((count ?? 0) > 0) {
    return {
      success: false,
      message: "Cette option est déjà utilisée dans des personnalisations et ne peut pas être supprimée.",
    };
  }

  const { data, error } = await supabase
    .from(kindValue)
    .delete()
    .eq("id", optionId)
    .select("id")
    .maybeSingle();

  if (error) {
    logError("Unable to delete cake option", error);
    return {
      success: false,
      message: error.code === "23503"
        ? "Cette option est déjà utilisée dans des personnalisations et ne peut pas être supprimée."
        : "Impossible de supprimer l’option.",
    };
  }
  if (!data) return { success: false, message: "Option introuvable." };

  revalidatePath(`/admin/options/${kindValue}`);
  revalidatePath("/customize/[id]", "page");
  return { success: true, message: "Option supprimée." };
}
