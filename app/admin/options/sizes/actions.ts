"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";

export type SizeFormState = { message: string; errors: { name?: string; price?: string } };
export type SizeMutationResult = { success: boolean; message: string };

function logSizeError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Size operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function validateSize(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();
  const price = Number(rawPrice);
  const errors: SizeFormState["errors"] = {};
  if (!name) errors.name = "Le nom de la taille est obligatoire.";
  if (!rawPrice) errors.price = "Le prix supplémentaire est obligatoire.";
  else if (!Number.isFinite(price) || price < 0) errors.price = "Le prix doit être un nombre positif ou nul.";
  return Object.keys(errors).length ? { data: null, errors } : { data: { name, price }, errors };
}

async function hasDuplicateName(
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"],
  name: string,
  excludedId?: number,
) {
  const { data, error } = await supabase.from("sizes").select("id,name");
  if (error) {
    logSizeError("check_duplicate_name", error);
    throw error;
  }
  const normalized = name.toLocaleLowerCase("fr-FR");
  return (data ?? []).some((size) => size.id !== excludedId && size.name.trim().toLocaleLowerCase("fr-FR") === normalized);
}

function revalidateSizes() {
  revalidatePath("/admin/options/sizes");
  revalidatePath("/customize/[id]", "page");
}

export async function createSize(_state: SizeFormState, formData: FormData): Promise<SizeFormState> {
  const validation = validateSize(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();

  try {
    if (await hasDuplicateName(supabase, validation.data.name)) {
      return { message: "Cette taille existe déjà.", errors: { name: "Utilisez un nom différent." } };
    }
  } catch {
    return { message: "Impossible de vérifier le nom de la taille.", errors: {} };
  }

  const { data, error } = await supabase.from("sizes").insert(validation.data).select("id").single();
  if (error) {
    logSizeError("create", error);
    return { message: error.code === "23505" ? "Cette taille existe déjà." : "Impossible de créer la taille.", errors: {} };
  }
  if (!data) return { message: "La création n’a retourné aucune taille.", errors: {} };
  revalidateSizes();
  redirect("/admin/options/sizes?success=created");
}

export async function updateSize(sizeId: number, _state: SizeFormState, formData: FormData): Promise<SizeFormState> {
  if (!Number.isInteger(sizeId) || sizeId <= 0) return { message: "Identifiant de taille invalide.", errors: {} };
  const validation = validateSize(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();

  try {
    if (await hasDuplicateName(supabase, validation.data.name, sizeId)) {
      return { message: "Cette taille existe déjà.", errors: { name: "Utilisez un nom différent." } };
    }
  } catch {
    return { message: "Impossible de vérifier le nom de la taille.", errors: {} };
  }

  const { data, error } = await supabase.from("sizes").update(validation.data).eq("id", sizeId).select("id").maybeSingle();
  if (error) {
    logSizeError("update", error);
    return { message: error.code === "23505" ? "Cette taille existe déjà." : "Impossible de modifier la taille.", errors: {} };
  }
  if (!data) return { message: "Taille introuvable.", errors: {} };
  revalidateSizes();
  redirect("/admin/options/sizes?success=updated");
}

export async function deleteSize(sizeId: number): Promise<SizeMutationResult> {
  if (!Number.isInteger(sizeId) || sizeId <= 0) return { success: false, message: "Identifiant de taille invalide." };
  const { supabase } = await requireAdminUser();
  const { count, error: countError } = await supabase
    .from("cake_customizations")
    .select("id", { count: "exact", head: true })
    .eq("size_id", sizeId);
  if (countError) {
    logSizeError("check_customizations_before_delete", countError);
    return { success: false, message: "Impossible de vérifier l’utilisation de cette taille." };
  }
  if ((count ?? 0) > 0) return { success: false, message: "Cette taille est déjà utilisée et ne peut pas être supprimée." };

  const { data, error } = await supabase.from("sizes").delete().eq("id", sizeId).select("id").maybeSingle();
  if (error) {
    logSizeError("delete", error);
    return { success: false, message: error.code === "23503" ? "Cette taille est déjà utilisée et ne peut pas être supprimée." : "Impossible de supprimer la taille." };
  }
  if (!data) return { success: false, message: "Taille introuvable." };
  revalidateSizes();
  return { success: true, message: "Taille supprimée." };
}
