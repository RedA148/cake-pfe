import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGE_BUCKET = "products";
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

const extensions: Record<(typeof PRODUCT_IMAGE_TYPES)[number], string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

type StorageError = { message: string; code?: string; details?: string; hint?: string };

export function logProductImageError(operation: string, error: StorageError) {
  console.error("Admin product operation failed", {
    operation,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export function validateProductImage(file: File): string | null {
  if (!PRODUCT_IMAGE_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_TYPES)[number])) {
    return "Le fichier doit être une image PNG, JPEG ou WebP.";
  }
  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return "L’image ne doit pas dépasser 5 Mo.";
  }
  return null;
}

export async function uploadProductImage(
  supabase: SupabaseClient,
  file: File,
  folder: string,
): Promise<{ publicUrl: string; path: string }> {
  const extension = extensions[file.type as keyof typeof extensions];
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "temp";
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    logProductImageError("Product image upload failed", error);
    throw error;
  }

  return {
    path,
    publicUrl: supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

export async function removeProductImage(supabase: SupabaseClient, path: string) {
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) logProductImageError("Product image cleanup failed", error);
}

export function getProductStoragePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  try {
    const storageOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
    const url = new URL(imageUrl);
    const prefix = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    if (url.origin !== storageOrigin || !url.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(url.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}
