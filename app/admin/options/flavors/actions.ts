"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";

export type FlavorFormState = { message: string; errors: { name?: string } };
export type FlavorMutationResult = { success: boolean; message: string };

function logFlavorError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Flavor operation failed", { operation, message: error.message, code: error.code, details: error.details, hint: error.hint });
}

function validateFlavor(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  return name
    ? { data: { name }, errors: {} }
    : { data: null, errors: { name: "Le nom de la saveur est obligatoire." } };
}

async function hasDuplicateName(
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"],
  name: string,
  excludedId?: number,
) {
  const { data, error } = await supabase.from("flavors").select("id,name");
  if (error) {
    logFlavorError("check_duplicate_name", error);
    throw error;
  }
  const normalized = name.toLocaleLowerCase("fr-FR");
  return (data ?? []).some((flavor) => flavor.id !== excludedId && flavor.name.trim().toLocaleLowerCase("fr-FR") === normalized);
}

function revalidateFlavors() {
  revalidatePath("/admin/options/flavors");
  revalidatePath("/customize/[id]", "page");
}

export async function createFlavor(_state: FlavorFormState, formData: FormData): Promise<FlavorFormState> {
  const validation = validateFlavor(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();
  try {
    if (await hasDuplicateName(supabase, validation.data.name)) return { message: "Cette saveur existe déjà.", errors: { name: "Utilisez un nom différent." } };
  } catch {
    return { message: "Impossible de vérifier le nom de la saveur.", errors: {} };
  }
  const { data, error } = await supabase.from("flavors").insert(validation.data).select("id").single();
  if (error) {
    logFlavorError("create", error);
    return { message: error.code === "23505" ? "Cette saveur existe déjà." : "Impossible de créer la saveur.", errors: {} };
  }
  if (!data) return { message: "La création n’a retourné aucune saveur.", errors: {} };
  revalidateFlavors();
  redirect("/admin/options/flavors?success=created");
}

export async function updateFlavor(flavorId: number, _state: FlavorFormState, formData: FormData): Promise<FlavorFormState> {
  if (!Number.isInteger(flavorId) || flavorId <= 0) return { message: "Identifiant de saveur invalide.", errors: {} };
  const validation = validateFlavor(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();
  try {
    if (await hasDuplicateName(supabase, validation.data.name, flavorId)) return { message: "Cette saveur existe déjà.", errors: { name: "Utilisez un nom différent." } };
  } catch {
    return { message: "Impossible de vérifier le nom de la saveur.", errors: {} };
  }
  const { data, error } = await supabase.from("flavors").update(validation.data).eq("id", flavorId).select("id").maybeSingle();
  if (error) {
    logFlavorError("update", error);
    return { message: error.code === "23505" ? "Cette saveur existe déjà." : "Impossible de modifier la saveur.", errors: {} };
  }
  if (!data) return { message: "Saveur introuvable.", errors: {} };
  revalidateFlavors();
  redirect("/admin/options/flavors?success=updated");
}

export async function deleteFlavor(flavorId: number): Promise<FlavorMutationResult> {
  if (!Number.isInteger(flavorId) || flavorId <= 0) return { success: false, message: "Identifiant de saveur invalide." };
  const { supabase } = await requireAdminUser();
  const { count, error: countError } = await supabase.from("cake_customizations").select("id", { count: "exact", head: true }).eq("flavor_id", flavorId);
  if (countError) {
    logFlavorError("check_customizations_before_delete", countError);
    return { success: false, message: "Impossible de vérifier l’utilisation de cette saveur." };
  }
  if ((count ?? 0) > 0) return { success: false, message: "Cette saveur est déjà utilisée et ne peut pas être supprimée." };
  const { data, error } = await supabase.from("flavors").delete().eq("id", flavorId).select("id").maybeSingle();
  if (error) {
    logFlavorError("delete", error);
    return { success: false, message: error.code === "23503" ? "Cette saveur est déjà utilisée et ne peut pas être supprimée." : "Impossible de supprimer la saveur." };
  }
  if (!data) return { success: false, message: "Saveur introuvable." };
  revalidateFlavors();
  return { success: true, message: "Saveur supprimée." };
}
