"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";

export type CategoryFormState = {
  message: string;
  errors: { name?: string };
};

export type CategoryMutationResult = {
  success: boolean;
  message: string;
};

function validateCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { data: null, errors: { name: "Le nom de la catégorie est obligatoire." } };
  }
  return { data: { name }, errors: {} };
}

function logCategoryError(operation: string, error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  console.error("Category operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function categoryErrorMessage(operation: "create" | "update" | "delete", error: { code?: string }) {
  if (error.code === "23505") return "Cette catégorie existe déjà.";
  if (error.code === "42501") return "Accès refusé par les politiques Supabase. Vérifiez les droits administrateur.";
  if (error.code === "23503") return "Cette catégorie contient des produits. Réaffectez-les avant de la supprimer.";
  return operation === "create"
    ? "Impossible de créer la catégorie."
    : operation === "update"
      ? "Impossible de modifier la catégorie."
      : "Impossible de supprimer la catégorie.";
}

export async function createCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const validation = validateCategory(formData);
  if (!validation.data) {
    return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  }

  const { supabase } = await requireAdminUser();
  const { data: createdCategory, error } = await supabase
    .from("categories")
    .insert(validation.data)
    .select("id")
    .single();
  if (error) {
    logCategoryError("create", error);
    return { message: categoryErrorMessage("create", error), errors: {} };
  }
  if (!createdCategory) return { message: "La création n’a retourné aucune catégorie.", errors: {} };

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  redirect("/admin/categories?success=created");
}

export async function updateCategory(
  categoryId: number,
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { message: "Identifiant de catégorie invalide.", errors: {} };
  }

  const validation = validateCategory(formData);
  if (!validation.data) {
    return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  }

  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("categories")
    .update(validation.data)
    .eq("id", categoryId)
    .select("id")
    .maybeSingle();

  if (error) {
    logCategoryError("update", error);
    return { message: categoryErrorMessage("update", error), errors: {} };
  }
  if (!data) return { message: "Catégorie introuvable.", errors: {} };

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  redirect("/admin/categories?success=updated");
}

export async function deleteCategory(categoryId: number): Promise<CategoryMutationResult> {
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { success: false, message: "Identifiant de catégorie invalide." };
  }

  const { supabase } = await requireAdminUser();
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (countError) {
    logCategoryError("check_products_before_delete", countError);
    return { success: false, message: "Impossible de vérifier les produits de cette catégorie." };
  }
  if ((count ?? 0) > 0) {
    return {
      success: false,
      message: "Cette catégorie contient des produits. Réaffectez-les avant de la supprimer.",
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .select("id")
    .maybeSingle();

  if (error) {
    logCategoryError("delete", error);
    return { success: false, message: categoryErrorMessage("delete", error) };
  }
  if (!data) return { success: false, message: "Catégorie introuvable." };

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true, message: "Catégorie supprimée." };
}
