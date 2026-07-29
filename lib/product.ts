export type Product = {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  base_price: number | string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  categories?: {
    id?: number;
    name: string;
  } | null;
};

export type ProductCategory = {
  id: number;
  name: string;
};

export function formatProductPrice(price: number | string) {
  return `À partir de ${price} DH`;
}

export function getProductBadge(product: Product): string | null {
  if (!product.is_available) {
    return "Indisponible";
  }

  return null;
}
