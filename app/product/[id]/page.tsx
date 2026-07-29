"use client";

import Link from "next/link";
import { Minus, Plus, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { formatProductPrice, type Product } from "@/lib/product";
import ProductImage from "@/components/ProductImage";

type ProductQueryRow = Omit<Product, "categories"> & {
  categories?: Product["categories"] | NonNullable<Product["categories"]>[];
};

const productColumns = `
  id,
  category_id,
  name,
  description,
  base_price,
  image_url,
  is_available,
  created_at,
  categories (
    name
  )
`;

function normalizeProduct(row: ProductQueryRow): Product {
  return {
    ...row,
    categories: Array.isArray(row.categories)
      ? row.categories[0] ?? null
      : row.categories ?? null,
  };
}

export default function ProductPage() {
  const params = useParams<{ id?: string | string[] }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const routeId = params?.id;
  const productId = typeof routeId === "string" ? Number(routeId) : Number.NaN;
  const hasValidProductId = Number.isInteger(productId) && productId > 0;

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadProduct() {
      if (!hasValidProductId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setNotFound(false);

      const supabase = createClient();
      const { data, error: productError } = await supabase
        .from("products")
        .select(productColumns)
        .eq("id", productId)
        .maybeSingle();

      if (!isCurrentRequest) return;

      if (productError) {
        console.error("Unable to load product details", {
          productId,
          message: productError.message,
          code: productError.code,
          details: productError.details,
          hint: productError.hint,
        });
        setError("Impossible de charger ce produit. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const nextProduct = normalizeProduct(data as ProductQueryRow);
      setProduct(nextProduct);
      setSelectedImage(nextProduct.image_url ?? "/images/products/cake1.jpg");

      const { data: relatedData, error: relatedError } = await supabase
        .from("products")
        .select(productColumns)
        .eq("is_available", true)
        .neq("id", productId)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!isCurrentRequest) return;

      if (relatedError) {
        console.error("Unable to load related products", {
          productId,
          message: relatedError.message,
          code: relatedError.code,
          details: relatedError.details,
          hint: relatedError.hint,
        });
        setRelatedProducts([]);
      } else {
        setRelatedProducts(
          (relatedData as ProductQueryRow[]).map(normalizeProduct),
        );
      }

      setLoading(false);
    }

    void loadProduct();

    return () => {
      isCurrentRequest = false;
    };
  }, [hasValidProductId, productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Chargement</p>
          <p className="mt-3 text-lg text-gray-600">Chargement du produit...</p>
        </section>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Produit introuvable</p>
          <p className="mt-3 text-lg text-gray-600">Le produit demandé n’existe pas.</p>
        </section>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-10" role="alert">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Erreur</p>
          <p className="mt-3 text-lg text-gray-600">{error ?? "Impossible de charger ce produit."}</p>
        </section>
      </main>
    );
  }

  const productImages = [selectedImage];
  const customizeHref = `/customize/${product.id}`;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]">
              <div className="relative aspect-square overflow-hidden">
                <ProductImage
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {productImages.map((image) => {
                const isActive = image === selectedImage;
                return (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-[20px] border transition duration-300 ${
                      isActive ? "border-[#D4AF37] shadow-md" : "border-gray-200"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <ProductImage
                        src={image}
                        alt="Thumbnail"
                        fill
                        sizes="80px"
                        className="object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit rounded-full bg-[#D4AF37] px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white">
              {product.categories?.name ?? `Catégorie ${product.category_id ?? "—"}`}
            </div>
            <h1 className="mt-5 text-4xl font-bold text-gray-900 sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-current" />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600">4.9 • 128 avis</span>
            </div>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 rounded-[20px] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                Prix de départ
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {formatProductPrice(product.base_price)}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Caractéristiques</h2>
              <ul className="mt-3 space-y-2 text-gray-700">
                {["Handmade", "Premium ingredients", "Fully customizable", "Fast delivery"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full p-2 text-[#D4AF37] transition hover:bg-[#FFF8E8]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-base font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-full p-2 text-[#D4AF37] transition hover:bg-[#FFF8E8]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={customizeHref}
                className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
              >
                Personnaliser
              </Link>
              <Link
                href="/cart"
                className="rounded-full border border-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#FFF8E8]"
              >
                Ajouter au panier
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Description du produit</h2>
          </div>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Chaque gâteau est confectionné à la main avec des finitions élégantes, des saveurs délicates et une personnalisation complète pour sublimer vos événements les plus marquants.
          </p>
        </div>

        <div className="mt-16 rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Avis clients</h2>
            <div className="flex items-center gap-2 text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-current" />
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-gray-200 bg-[#FAFAFA] p-5">
            <p className="text-gray-700">
              “Un gâteau absolument magnifique, parfaitement personnalisé et livré avec élégance. Une expérience vraiment premium.”
            </p>
            <p className="mt-3 font-semibold text-gray-900">— Sarah M.</p>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Produits similaires</h2>
            <Link href="/catalogue" className="text-sm font-semibold text-[#D4AF37] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ProductImage
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#D4AF37]">
                    {formatProductPrice(item.base_price)}
                  </p>
                  <Link
                    href={`/product/${item.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-[#D4AF37] hover:underline"
                  >
                    Voir le produit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
