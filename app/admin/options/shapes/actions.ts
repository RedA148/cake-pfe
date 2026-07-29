"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";

export type ShapeFormState = { message: string; errors: { name?: string } };
export type ShapeMutationResult = { success: boolean; message: string };

function logShapeError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Shape operation failed", { operation, message: error.message, code: error.code, details: error.details, hint: error.hint });
}

function validateShape(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  return name
    ? { data: { name }, errors: {} }
    : { data: null, errors: { name: "Le nom de la forme est obligatoire." } };
}

async function hasDuplicateName(
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"],
  name: string,
  excludedId?: number,
) {
  const { data, error } = await supabase.from("shapes").select("id,name");
  if (error) {
    logShapeError("check_duplicate_name", error);
    throw error;
  }
  const normalized = name.toLocaleLowerCase("fr-FR");
  return (data ?? []).some((shape) => shape.id !== excludedId && shape.name.trim().toLocaleLowerCase("fr-FR") === normalized);
}

function revalidateShapes() {
  revalidatePath("/admin/options/shapes");
  revalidatePath("/customize/[id]", "page");
}

export async function createShape(_state: ShapeFormState, formData: FormData): Promise<ShapeFormState> {
  const validation = validateShape(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();
  try {
    if (await hasDuplicateName(supabase, validation.data.name)) return { message: "Cette forme existe déjà.", errors: { name: "Utilisez un nom différent." } };
  } catch {
    return { message: "Impossible de vérifier le nom de la forme.", errors: {} };
  }
  const { data, error } = await supabase.from("shapes").insert(validation.data).select("id").single();
  if (error) {
    logShapeError("create", error);
    return { message: error.code === "23505" ? "Cette forme existe déjà." : "Impossible de créer la forme.", errors: {} };
  }
  if (!data) return { message: "La création n’a retourné aucune forme.", errors: {} };
  revalidateShapes();
  redirect("/admin/options/shapes?success=created");
}

export async function updateShape(shapeId: number, _state: ShapeFormState, formData: FormData): Promise<ShapeFormState> {
  if (!Number.isInteger(shapeId) || shapeId <= 0) return { message: "Identifiant de forme invalide.", errors: {} };
  const validation = validateShape(formData);
  if (!validation.data) return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  const { supabase } = await requireAdminUser();
  try {
    if (await hasDuplicateName(supabase, validation.data.name, shapeId)) return { message: "Cette forme existe déjà.", errors: { name: "Utilisez un nom différent." } };
  } catch {
    return { message: "Impossible de vérifier le nom de la forme.", errors: {} };
  }
  const { data, error } = await supabase.from("shapes").update(validation.data).eq("id", shapeId).select("id").maybeSingle();
  if (error) {
    logShapeError("update", error);
    return { message: error.code === "23505" ? "Cette forme existe déjà." : "Impossible de modifier la forme.", errors: {} };
  }
  if (!data) return { message: "Forme introuvable.", errors: {} };
  revalidateShapes();
  redirect("/admin/options/shapes?success=updated");
}

export async function deleteShape(shapeId: number): Promise<ShapeMutationResult> {
  if (!Number.isInteger(shapeId) || shapeId <= 0) return { success: false, message: "Identifiant de forme invalide." };
  const { supabase } = await requireAdminUser();
  const { count, error: countError } = await supabase.from("cake_customizations").select("id", { count: "exact", head: true }).eq("shape_id", shapeId);
  if (countError) {
    logShapeError("check_customizations_before_delete", countError);
    return { success: false, message: "Impossible de vérifier l’utilisation de cette forme." };
  }
  if ((count ?? 0) > 0) return { success: false, message: "Cette forme est déjà utilisée et ne peut pas être supprimée." };
  const { data, error } = await supabase.from("shapes").delete().eq("id", shapeId).select("id").maybeSingle();
  if (error) {
    logShapeError("delete", error);
    return { success: false, message: error.code === "23503" ? "Cette forme est déjà utilisée et ne peut pas être supprimée." : "Impossible de supprimer la forme." };
  }
  if (!data) return { success: false, message: "Forme introuvable." };
  revalidateShapes();
  return { success: true, message: "Forme supprimée." };
}
