"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";

export type ColorFormState = { message: string; errors: { name?: string; hex_color?: string } };
export type ColorMutationResult = { success: boolean; message: string };

function logColorError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Color operation failed", { operation, message: error.message, code: error.code, details: error.details, hint: error.hint });
}

function validateColor(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const hexColor = String(formData.get("hex_color") ?? "").trim().toUpperCase();
  const errors: ColorFormState["errors"] = {};
  if (!name) errors.name = "Le nom de la couleur est obligatoire.";
  if (!hexColor) errors.hex_color = "La valeur hexadécimale est obligatoire.";
  else if (!/^#[0-9A-F]{6}$/.test(hexColor)) errors.hex_color = "Utilisez une valeur valide au format #FFFFFF.";
  return Object.keys(errors).length > 0 ? { data: null, errors } : { data: { name, hex_color: hexColor }, errors };
}

async function findDuplicate(
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"],
  name: string,
  hexColor: string,
  excludedId?: number,
) {
  const { data, error } = await supabase.from("colors").select("id,name,hex_color");
  if (error) {
    logColorError("check_duplicates", error);
    throw error;
  }
  const normalizedName = name.toLocaleLowerCase("fr-FR");
  const rows = (data ?? []).filter((color) => color.id !== excludedId);
  if (rows.some((color) => color.name.trim().toLocaleLowerCase("fr-FR") === normalizedName)) return "name";
  if (rows.some((color) => color.hex_color.trim().toUpperCase() === hexColor)) return "hex_color";
  return null;
}

function duplicateState(field: "name" | "hex_color"): ColorFormState {
  return field === "name"
    ? { message: "Cette couleur existe déjà.", errors: { name: "Utilisez un nom différent." } }
    : { message: "Cette valeur hexadécimale existe déjà.", errors: { hex_color: "Utilisez une couleur différente." } };
}

function colorMutationMessage(
  operation: "create" | "update",
  error: { message: string; code?: string },
): string {
  if (error.code === "23505") return "Cette couleur existe déjà.";
  if (error.code === "42501" || /row-level security|permission denied/i.test(error.message)) {
    return "Écriture refusée par Supabase. Appliquez la migration RLS des couleurs puis réessayez.";
  }
  if (error.code === "PGRST204" || error.code === "42703") {
    return "La colonne hex_color est indisponible dans le cache du schéma Supabase.";
  }
  return operation === "create" ? "Impossible de créer la couleur." : "Impossible de modifier la couleur.";
}

function revalidateColors() {
  revalidatePath("/admin/options/colors");
  revalidatePath("/customize/[id]", "page");
}

export async function createColor(_state: ColorFormState, formData: FormData): Promise<ColorFormState> {
  const validation = validateColor(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();
  try {
    const duplicate = await findDuplicate(supabase, validation.data.name, validation.data.hex_color);
    if (duplicate) return duplicateState(duplicate);
  } catch {
    return { message: "Impossible de vérifier cette couleur.", errors: {} };
  }
  const { data, error } = await supabase.from("colors").insert(validation.data).select("id").single();
  if (error) {
    logColorError("create", error);
    return { message: colorMutationMessage("create", error), errors: {} };
  }
  if (!data) return { message: "La création n’a retourné aucune couleur.", errors: {} };
  revalidateColors();
  redirect("/admin/options/colors?success=created");
}

export async function updateColor(colorId: number, _state: ColorFormState, formData: FormData): Promise<ColorFormState> {
  if (!Number.isInteger(colorId) || colorId <= 0) return { message: "Identifiant de couleur invalide.", errors: {} };
  const validation = validateColor(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();
  try {
    const duplicate = await findDuplicate(supabase, validation.data.name, validation.data.hex_color, colorId);
    if (duplicate) return duplicateState(duplicate);
  } catch {
    return { message: "Impossible de vérifier cette couleur.", errors: {} };
  }
  const { data, error } = await supabase.from("colors").update(validation.data).eq("id", colorId).select("id").maybeSingle();
  if (error) {
    logColorError("update", error);
    return { message: colorMutationMessage("update", error), errors: {} };
  }
  if (!data) return { message: "Couleur introuvable.", errors: {} };
  revalidateColors();
  redirect("/admin/options/colors?success=updated");
}

export async function deleteColor(colorId: number): Promise<ColorMutationResult> {
  if (!Number.isInteger(colorId) || colorId <= 0) return { success: false, message: "Identifiant de couleur invalide." };
  const { supabase } = await requireAdminUser();
  const { count, error: countError } = await supabase.from("cake_customizations").select("id", { count: "exact", head: true }).eq("color_id", colorId);
  if (countError) {
    logColorError("check_customizations_before_delete", countError);
    return { success: false, message: "Impossible de vérifier l’utilisation de cette couleur." };
  }
  if ((count ?? 0) > 0) return { success: false, message: "Cette couleur est déjà utilisée et ne peut pas être supprimée." };
  const { data, error } = await supabase.from("colors").delete().eq("id", colorId).select("id").maybeSingle();
  if (error) {
    logColorError("delete", error);
    return { success: false, message: error.code === "23503" ? "Cette couleur est déjà utilisée et ne peut pas être supprimée." : "Impossible de supprimer la couleur." };
  }
  if (!data) return { success: false, message: "Couleur introuvable." };
  revalidateColors();
  return { success: true, message: "Couleur supprimée." };
}
