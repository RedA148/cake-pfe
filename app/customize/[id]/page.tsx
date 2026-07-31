"use client";

import { BadgeCheck, Circle, Diamond, Heart, Pentagon, RectangleHorizontal, Ruler, Sparkles, Square, Star, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import type { Product } from "@/lib/product";
import CakeShapePreview from "@/components/CakeShapePreview";
import {
  getShapeCode,
  type CakeColor,
  type CakeFlavor,
  type CakeShape,
  type CakeSize,
} from "@/lib/cake-options";

type CartItem = {
  productId: number;
  productName: string;
  productImage: string;
  category?: string;
  shape_id: number;
  size_id: number;
  flavor_id: number;
  color_id: number;
  shape: string;
  size: string;
  flavor: string;
  color: string;
  customText: string;
  instructions: string;
  uploadedImage: string | null;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
};

export default function CustomizePage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const [sizes, setSizes] = useState<CakeSize[]>([]);
  const [shapes, setShapes] = useState<CakeShape[]>([]);
  const [flavors, setFlavors] = useState<CakeFlavor[]>([]);
  const [colors, setColors] = useState<CakeColor[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addInProgressRef = useRef(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const routeId = params?.id;
  const productId = typeof routeId === "string" && routeId.trim() !== "" ? Number(routeId) : Number.NaN;
  const hasValidProductId = Number.isInteger(productId) && productId > 0;

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadProduct() {
      if (!hasValidProductId) {
        setProduct(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setNotFound(false);
      setProduct(null);

      const supabase = createClient();
      const [productResult, sizesResult, shapesResult, flavorsResult, colorsResult] = await Promise.all([
        supabase.from("products").select(`
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
        `).eq("id", productId).maybeSingle(),
        supabase.from("sizes").select("id, name, price").order("price", { ascending: true }).order("id", { ascending: true }),
        supabase.from("shapes").select("id, name").order("name", { ascending: true }).order("id", { ascending: true }),
        supabase.from("flavors").select("id, name").order("id"),
        supabase.from("colors").select("id, name, hex_color").order("name").order("id"),
      ]);

      if (!isCurrentRequest) return;

      const failedResult = [productResult, sizesResult, shapesResult, flavorsResult, colorsResult]
        .find((result) => result.error);
      if (failedResult?.error) {
        console.error("Unable to load customization options", {
          message: failedResult.error.message,
          code: failedResult.error.code,
          details: failedResult.error.details,
          hint: failedResult.error.hint,
        });
        setError("Impossible de charger les options de personnalisation. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      if (!productResult.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const productData = productResult.data as Omit<Product, "categories"> & {
        categories?: Product["categories"] | { name: string }[];
      };
      const category = Array.isArray(productData.categories)
        ? productData.categories[0] ?? null
        : productData.categories ?? null;

      setProduct({ ...productData, categories: category });
      const nextSizes = sizesResult.data as CakeSize[];
      const nextShapes = shapesResult.data as CakeShape[];
      const nextFlavors = flavorsResult.data as CakeFlavor[];
      const nextColors = colorsResult.data as CakeColor[];
      setSizes(nextSizes);
      setShapes(nextShapes);
      setFlavors(nextFlavors);
      setColors(nextColors);
      setSelectedSizeId(nextSizes[0]?.id ?? null);
      setSelectedShapeId(nextShapes[0]?.id ?? null);
      setSelectedFlavorId(nextFlavors[0]?.id ?? null);
      setSelectedColorId(nextColors[0]?.id ?? null);
      setLoading(false);
    }

    void loadProduct();

    return () => {
      isCurrentRequest = false;
    };
  }, [hasValidProductId, productId]);

  const basePrice = product ? Number(product.base_price) || 0 : 0;
  const selectedSize = sizes.find((option) => option.id === selectedSizeId) ?? null;
  const selectedShape = shapes.find((option) => option.id === selectedShapeId) ?? null;
  const selectedFlavor = flavors.find((option) => option.id === selectedFlavorId) ?? null;
  const selectedColor = colors.find((option) => option.id === selectedColorId) ?? null;
  const sizeExtraPrice = Number(selectedSize?.price ?? 0) || 0;
  const totalPrice = basePrice + sizeExtraPrice;
  const hasCompleteOptions = Boolean(selectedSize && selectedShape && selectedFlavor && selectedColor);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    if (!product || !product.is_available || !hasCompleteOptions || isAdding || addInProgressRef.current) {
      return;
    }

    if (typeof window === "undefined") {
      console.error("[CustomizePage] localStorage is unavailable outside the browser");
      return;
    }

    addInProgressRef.current = true;
    setIsAdding(true);

    try {
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.image_url ?? "",
        category: product.categories?.name ?? undefined,
        shape_id: selectedShape!.id,
        size_id: selectedSize!.id,
        flavor_id: selectedFlavor!.id,
        color_id: selectedColor!.id,
        shape: selectedShape!.name,
        size: selectedSize!.name,
        flavor: selectedFlavor!.name,
        color: selectedColor!.name,
        customText: text,
        instructions,
        uploadedImage: imagePreview,
        quantity: 1,
        totalPrice,
        unitPrice: totalPrice,
      };

      const storedCart = window.localStorage.getItem("cart");
      let cart: CartItem[] = [];

      if (storedCart) {
        try {
          const parsedCart: unknown = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            cart = parsedCart as CartItem[];
          }
        } catch (error) {
          console.error("Unable to parse guest cart", {
            message: error instanceof Error ? error.message : "Invalid localStorage cart",
          });
        }
      }

      const duplicateIndex = cart.findIndex(
        (item) =>
          item.productId === cartItem.productId &&
          item.shape_id === cartItem.shape_id &&
          item.size_id === cartItem.size_id &&
          item.flavor_id === cartItem.flavor_id &&
          item.color_id === cartItem.color_id &&
          item.customText === cartItem.customText &&
          item.instructions === cartItem.instructions &&
          item.uploadedImage === cartItem.uploadedImage,
      );

      if (duplicateIndex > -1) {
        const existingItem = cart[duplicateIndex];
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        cart.push(cartItem);
      }

      window.localStorage.setItem("cart", JSON.stringify(cart));

      setShowToast(true);
      window.setTimeout(() => {
        router.push("/cart");
      }, 1000);
    } catch (error) {
      console.error("Unable to add item to guest cart", {
        message: error instanceof Error ? error.message : "Unknown cart error",
      });
      addInProgressRef.current = false;
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Chargement</p>
            <p className="mt-3 text-lg text-gray-600">Chargement du produit...</p>
          </div>
        </section>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Produit introuvable</p>
            <p className="mt-3 text-lg text-gray-600">Le produit demandé n’existe pas.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-8" role="alert">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Erreur</p>
            <p className="mt-3 text-lg text-gray-600">{error ?? "Le produit demandé n’existe pas."}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Création sur mesure
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Personnalisez votre gâteau
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Choisissez chaque détail pour créer un gâteau unique.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* relative */}
          <div className="rounded-[28px] relative border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Aperçu en direct
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">Votre création</h2>
              </div>
              <div className="rounded-full border border-[#D4AF37] px-3 py-1 text-sm font-semibold text-[#D4AF37]">
                {selectedSize?.name ?? "Aucune taille"}
              </div>
            </div>
            {/* stickey image */}
            <div className="rounded-[32px] sticky top-4 border border-gray-200 bg-[#FFF8E8] p-6 sm:p-8">
              <div className="mx-auto flex max-w-[420px] items-center justify-center">
                <CakeShapePreview
                  shapeName={selectedShape?.name}
                  color={selectedColor?.hex_color ?? "#D4AF37"}
                  imageUrl={imagePreview}
                  imageAlt="Aperçu de l’image personnalisée sur le gâteau"
                >
                  <div className="text-center text-sm font-medium text-gray-700">
                    <Sparkles className="mx-auto mb-2 h-8 w-8 text-[#D4AF37]" />
                    <p>Votre gâteau prendra forme ici</p>
                  </div>
                </CakeShapePreview>
              </div>

              <div className="mt-6 rounded-[24px] border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Sélection actuelle
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {selectedFlavor?.name ?? "Aucune saveur"} • {selectedShape?.name ?? "Aucune forme"}
                </p>
                {text ? (
                  <p className="mt-2 text-sm text-gray-600">Texte: “{text}”</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">1. Forme</h2>
                <p className="mt-1 text-sm text-gray-500">Choisissez la silhouette de votre gâteau</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {shapes.length === 0 ? <p className="col-span-full text-sm text-amber-700">Aucune forme disponible.</p> : null}
                {shapes.map((option) => {
                  const shapeCode = getShapeCode(option.name);
                  const Icon = shapeCode === "round"
                    ? Circle
                    : shapeCode === "square"
                      ? Square
                      : shapeCode === "heart"
                        ? Heart
                        : shapeCode === "star"
                          ? Star
                          : shapeCode === "rectangle"
                            ? RectangleHorizontal
                            : shapeCode === "pentagon"
                              ? Pentagon
                              : shapeCode === "rhombus"
                                ? Diamond
                                : Sparkles;
                  const isActive = option.id === selectedShapeId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedShapeId(option.id)}
                      aria-label={`Choisir la forme ${option.name}`}
                      className={`rounded-[20px] border p-4 text-center transition duration-300 ${
                        isActive
                          ? "border-[#D4AF37] bg-[#FFF8E8] text-[#D4AF37] shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37]"
                      }`}
                    >
                      <Icon className="mx-auto h-6 w-6" />
                      <p className="mt-2 text-sm font-semibold">{option.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">2. Taille</h2>
                <p className="mt-1 text-sm text-gray-500">Sélectionnez la taille idéale</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sizes.length === 0 ? <p className="col-span-full text-sm text-amber-700">Aucune taille disponible.</p> : null}
                {sizes.map((option) => {
                  const isActive = option.id === selectedSizeId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedSizeId(option.id)}
                      aria-label={`Choisir la taille ${option.name}`}
                      className={`rounded-[20px] border p-4 text-left transition duration-300 ${
                        isActive
                          ? "border-[#D4AF37] bg-[#FFF8E8] text-[#D4AF37] shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        <span className="font-semibold">{option.name}</span>
                      </div>
                      <p className="mt-2 text-sm">
                        +{option.price} DH
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">3. Saveur</h2>
                <p className="mt-1 text-sm text-gray-500">Choisissez les arômes de votre gâteau</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {flavors.length === 0 ? <p className="col-span-full text-sm text-amber-700">Aucune saveur disponible.</p> : null}
                {flavors.map((option) => {
                  const isActive = option.id === selectedFlavorId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedFlavorId(option.id)}
                      aria-label={`Choisir la saveur ${option.name}`}
                      className={`rounded-[20px] border p-3 text-sm font-semibold transition duration-300 ${
                        isActive
                          ? "border-[#D4AF37] bg-[#FFF8E8] text-[#D4AF37]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37]"
                      }`}
                    >
                      {option.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">4. Couleur</h2>
                <p className="mt-1 text-sm text-gray-500">Personnalisez la teinte principale</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.length === 0 ? <p className="text-sm text-amber-700">Aucune couleur disponible.</p> : null}
                {colors.map((option) => {
                  const isActive = option.id === selectedColorId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedColorId(option.id)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
                        isActive ? "border-[#D4AF37] scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: option.hex_color }}
                      title={option.name}
                      aria-label={`Choisir la couleur ${option.name}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">5. Texte du gâteau</h2>
              </div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Votre texte..."
                className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none ring-0 focus:border-[#D4AF37]"
              />
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">6. Ajouter une image</h2>
                <p className="mt-1 text-sm text-gray-500">Téléchargez une photo pour votre design</p>
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#D4AF37] bg-[#FFF8E8] px-6 py-10 text-center transition hover:bg-[#fff3d8]">
                <Upload className="h-8 w-8 text-[#D4AF37]" />
                <span className="mt-3 text-sm font-semibold text-[#D4AF37]">Cliquer pour télécharger</span>
                <span className="mt-1 text-sm text-gray-600">PNG, JPG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} aria-label="Télécharger une image pour le gâteau" />
              </label>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">7. Instructions spéciales</h2>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Ajoutez vos détails spéciaux..."
                className="w-full rounded-[20px] border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                    Résumé
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">Votre commande</h3>
                </div>
                <div className="rounded-full bg-[#FFF8E8] px-3 py-1 text-sm font-semibold text-[#D4AF37]">
                  {selectedSize?.name ?? "Aucune taille"}
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Prix de base</span>
                  <span className="font-semibold text-gray-900">{basePrice} DH</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplément taille</span>
                  <span className="font-semibold text-gray-900">+{sizeExtraPrice} DH</span>
                </div>
                <div className="flex justify-between">
                  <span>Options sélectionnées</span>
                  <span className="font-semibold text-gray-900">{selectedSize?.name ?? "—"} • {selectedFlavor?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">{totalPrice} DH</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product || !product.is_available || !hasCompleteOptions || isAdding}
                aria-label="Ajouter cette création au panier"
                className="mt-6 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f] disabled:opacity-55"
              >
                {isAdding ? "Ajout en cours..." : "Ajouter au panier"}
              </button>
              {!product.is_available ? (
                <p className="mt-3 text-center text-sm font-medium text-gray-600">
                  Ce produit est actuellement indisponible.
                </p>
              ) : null}
              {!hasCompleteOptions ? (
                <p className="mt-3 text-center text-sm font-medium text-amber-700">
                  Toutes les catégories d’options doivent contenir au moins un choix.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-4 text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-all duration-500 border border-white/10 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold">Produit ajouté au panier</span>
        </div>
      )}
    </main>
  );
}
