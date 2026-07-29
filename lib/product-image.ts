export const PRODUCT_IMAGE_FALLBACK = "/images/products/cake1.jpg";

export function isSupabaseStorageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.hostname === "mrnvxzomgfsvdfkyrxyz.supabase.co" &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

export function getProductImageSource(value: string | null | undefined): string {
  const source = value?.trim();
  if (!source) return PRODUCT_IMAGE_FALLBACK;
  if (source.startsWith("/") || source.startsWith("blob:")) return source;

  try {
    const url = new URL(source);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : PRODUCT_IMAGE_FALLBACK;
  } catch {
    return PRODUCT_IMAGE_FALLBACK;
  }
}
