"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  getProductStoragePath,
  removeProductImage,
  uploadProductImage,
  validateProductImage,
} from "@/lib/product-image-storage";

export type ProductFormState = {
  message: string;
  errors: Partial<
    Record<"name" | "description" | "category_id" | "base_price" | "image_url" | "image_file", string>
  >;
};

export type ProductMutationResult = {
  success: boolean;
  message: string;
};

type ValidatedProductInput = {
  name: string;
  description: string | null;
  category_id: number;
  base_price: number;
  image_url: string | null;
  is_available: boolean;
};

function validateProduct(formData: FormData):
  | { data: ValidatedProductInput; errors?: never }
  | { data?: never; errors: ProductFormState["errors"] } {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const basePrice = Number(formData.get("base_price"));
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const errors: ProductFormState["errors"] = {};

  if (!name) errors.name = "Le nom du produit est obligatoire.";
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.category_id = "Sélectionnez une catégorie valide.";
  }
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    errors.base_price = "Le prix doit être un nombre positif.";
  }
  if (imageUrl) {
    if (!imageUrl.startsWith("/")) {
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.image_url = "Saisissez une URL d’image valide.";
        }
      } catch {
        errors.image_url = "Saisissez une URL d’image valide.";
      }
    }
  }

  if (Object.keys(errors).length) return { errors };

  return {
    data: {
      name,
      description: description || null,
      category_id: categoryId,
      base_price: basePrice,
      image_url: imageUrl || null,
      is_available: formData.get("is_available") === "on",
    },
  };
}

function logAdminProductError(operation: string, error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}) {
  console.error("Admin product operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function productErrorMessage(operation: "create" | "update" | "delete" | "toggle", error: { code?: string }) {
  if (error.code === "42501") return "Accès refusé par les politiques Supabase. Vérifiez les droits administrateur.";
  if (error.code === "23503") {
    return operation === "delete"
      ? "Ce produit est utilisé par une commande et ne peut pas être supprimé."
      : "La catégorie sélectionnée n’existe plus.";
  }
  if (error.code === "23502" || error.code === "PGRST204") {
    return "Le schéma de la table products ne correspond pas aux champs attendus.";
  }
  const message = operation === "create"
    ? "Impossible de créer le produit. Consultez le journal serveur pour le détail."
    : operation === "update"
      ? "Impossible de modifier le produit. Consultez le journal serveur pour le détail."
      : operation === "delete"
        ? "Impossible de supprimer le produit. Consultez le journal serveur pour le détail."
        : "Impossible de modifier la disponibilité. Consultez le journal serveur pour le détail.";
  return error.code ? `${message} Code Supabase : ${error.code}.` : message;
}

function getImageFile(formData: FormData): File | null {
  const value = formData.get("image_file");
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const validation = validateProduct(formData);
  const imageFile = getImageFile(formData);
  const imageError = imageFile ? validateProductImage(imageFile) : null;
  if (imageError) {
    return { message: "Corrigez les champs indiqués.", errors: { image_file: imageError } };
  }
  if (validation.errors) {
    return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  }

  const { supabase } = await requireAdminUser();
  let uploadedPath: string | null = null;
  if (imageFile) {
    try {
      const uploaded = await uploadProductImage(supabase, imageFile, "temp");
      uploadedPath = uploaded.path;
      validation.data.image_url = uploaded.publicUrl;
    } catch {
      return { message: "Impossible de téléverser l’image du produit.", errors: { image_file: "Le téléversement a échoué. Veuillez réessayer." } };
    }
  }

  const { data: createdProduct, error } = await supabase
    .from("products")
    .insert(validation.data)
    .select("id")
    .single();

  if (error) {
    logAdminProductError("create", error);
    if (uploadedPath) await removeProductImage(supabase, uploadedPath);
    return { message: productErrorMessage("create", error), errors: {} };
  }
  if (!createdProduct) {
    if (uploadedPath) await removeProductImage(supabase, uploadedPath);
    return { message: "La création n’a retourné aucun produit.", errors: {} };
  }

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/products");
  redirect("/admin/products?success=created");
}

export async function updateProduct(
  productId: number,
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return { message: "Identifiant de produit invalide.", errors: {} };
  }

  const validation = validateProduct(formData);
  const imageFile = getImageFile(formData);
  const imageError = imageFile ? validateProductImage(imageFile) : null;
  if (imageError) {
    return { message: "Corrigez les champs indiqués.", errors: { image_file: imageError } };
  }
  if (validation.errors) {
    return { message: "Corrigez les champs indiqués.", errors: validation.errors };
  }

  const { supabase } = await requireAdminUser();
  const { data: currentProduct, error: currentProductError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();
  if (currentProductError) {
    logAdminProductError("load_for_update", currentProductError);
    return { message: "Impossible de charger l’image actuelle du produit.", errors: {} };
  }
  if (!currentProduct) return { message: "Produit introuvable.", errors: {} };

  const oldStoragePath = getProductStoragePath(currentProduct.image_url);
  let uploadedPath: string | null = null;
  if (imageFile) {
    try {
      const uploaded = await uploadProductImage(supabase, imageFile, String(productId));
      uploadedPath = uploaded.path;
      validation.data.image_url = uploaded.publicUrl;
    } catch {
      return { message: "Impossible de téléverser l’image du produit.", errors: { image_file: "Le téléversement a échoué. Veuillez réessayer." } };
    }
  } else if (formData.get("remove_image") === "on") {
    validation.data.image_url = null;
  }

  const { data, error } = await supabase
    .from("products")
    .update(validation.data)
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    logAdminProductError("update", error);
    if (uploadedPath) await removeProductImage(supabase, uploadedPath);
    return { message: productErrorMessage("update", error), errors: {} };
  }
  if (!data) {
    if (uploadedPath) await removeProductImage(supabase, uploadedPath);
    return { message: "La mise à jour n’a modifié aucun produit.", errors: {} };
  }

  if (oldStoragePath && currentProduct.image_url !== validation.data.image_url) {
    await removeProductImage(supabase, oldStoragePath);
  }

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath(`/product/${productId}`);
  revalidatePath(`/customize/${productId}`);
  revalidatePath("/admin/products");
  redirect("/admin/products?success=updated");
}

export async function deleteProduct(productId: number): Promise<ProductMutationResult> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, message: "Identifiant de produit invalide." };
  }

  const { supabase } = await requireAdminUser();
  const { data: currentProduct, error: currentProductError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();
  if (currentProductError) {
    logAdminProductError("load_for_delete", currentProductError);
    return { success: false, message: "Impossible de charger le produit." };
  }
  if (!currentProduct) return { success: false, message: "Le produit n’existe plus." };
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    logAdminProductError("delete", error);
    return { success: false, message: productErrorMessage("delete", error) };
  }
  if (!data) return { success: false, message: "La suppression n’a modifié aucun produit." };

  const storedImagePath = getProductStoragePath(currentProduct?.image_url ?? null);
  if (storedImagePath) await removeProductImage(supabase, storedImagePath);

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/products");
  return { success: true, message: "Produit supprimé." };
}

export async function setProductAvailability(
  productId: number,
  isAvailable: boolean,
): Promise<ProductMutationResult> {
  if (!Number.isInteger(productId) || productId <= 0 || typeof isAvailable !== "boolean") {
    return { success: false, message: "Données de disponibilité invalides." };
  }

  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    logAdminProductError("toggle", error);
    return { success: false, message: productErrorMessage("toggle", error) };
  }
  if (!data) return { success: false, message: "La disponibilité n’a pas été modifiée." };

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/products");
  return { success: true, message: "Disponibilité mise à jour." };
}
