"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Product, ProductCategory } from "@/lib/product";
import { getProductImageSource, PRODUCT_IMAGE_FALLBACK } from "@/lib/product-image";
import type { ProductFormState } from "@/app/admin/products/actions";

const initialProductFormState: ProductFormState = {
  message: "",
  errors: {},
};

type ProductFormProps = {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  categories: ProductCategory[];
  product?: Product;
};

export default function ProductForm({ action, categories, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialProductFormState,
  );
  const [previewUrl, setPreviewUrl] = useState(() => getProductImageSource(product?.image_url));
  const [selectedFile, setSelectedFile] = useState(false);
  const [clientImageError, setClientImageError] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setClientImageError("");
    if (!file) {
      setSelectedFile(false);
      setPreviewUrl(removeImage ? PRODUCT_IMAGE_FALLBACK : getProductImageSource(product?.image_url));
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      event.target.value = "";
      setSelectedFile(false);
      setClientImageError("Le fichier doit être une image PNG, JPEG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setSelectedFile(false);
      setClientImageError("L’image ne doit pas dépasser 5 Mo.");
      return;
    }
    setSelectedFile(true);
    setRemoveImage(false);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const fieldClassName =
    "mt-2 w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15";

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-gray-800">
          Nom du produit
        </label>
        <input
          id="name"
          name="name"
          defaultValue={product?.name ?? ""}
          required
          className={fieldClassName}
        />
        {state.errors.name ? <p className="mt-2 text-sm text-red-600">{state.errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-semibold text-gray-800">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          className={fieldClassName}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category_id" className="text-sm font-semibold text-gray-800">
            Catégorie
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            required
            disabled={categories.length === 0}
            className={fieldClassName}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.length === 0 ? (
            <p className="mt-2 text-sm text-amber-700">Aucune catégorie disponible.</p>
          ) : null}
          {state.errors.category_id ? (
            <p className="mt-2 text-sm text-red-600">{state.errors.category_id}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="base_price" className="text-sm font-semibold text-gray-800">
            Prix de base (DH)
          </label>
          <input
            id="base_price"
            name="base_price"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={product?.base_price ?? ""}
            required
            className={fieldClassName}
          />
          {state.errors.base_price ? (
            <p className="mt-2 text-sm text-red-600">{state.errors.base_price}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
        <label htmlFor="image_file" className="text-sm font-semibold text-gray-800">
          Image du produit
        </label>
        {previewUrl ? (
          <div className="relative mt-4 h-48 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- Admin-only preview bypasses the image optimizer. */}
            <img
              src={getProductImageSource(previewUrl)}
              alt="Aperçu de l’image du produit"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
                setPreviewUrl(PRODUCT_IMAGE_FALLBACK);
              }}
            />
          </div>
        ) : null}
        <input
          id="image_file"
          ref={fileInputRef}
          name="image_file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          className="mt-4 block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#D4AF37] file:px-4 file:py-2 file:font-semibold file:text-white"
        />
        <p className="mt-2 text-xs text-gray-500">PNG, JPEG ou WebP · 5 Mo maximum.</p>
        {clientImageError || state.errors.image_file ? (
          <p className="mt-2 text-sm text-red-600">{clientImageError || state.errors.image_file}</p>
        ) : null}
        {product?.image_url ? (
          <label className="mt-4 flex items-center gap-3 text-sm text-gray-700">
            <input
              name="remove_image"
              type="checkbox"
              checked={removeImage}
              onChange={(event) => {
                setRemoveImage(event.target.checked);
                setSelectedFile(false);
                if (event.target.checked && fileInputRef.current) fileInputRef.current.value = "";
                setPreviewUrl(event.target.checked ? PRODUCT_IMAGE_FALLBACK : getProductImageSource(product.image_url));
              }}
              className="h-4 w-4 accent-[#D4AF37]"
            />
            Supprimer l’image actuelle
          </label>
        ) : null}
      </div>

      <div>
        <label htmlFor="image_url" className="text-sm font-semibold text-gray-800">
          URL de l’image (facultatif)
        </label>
        <input
          id="image_url"
          name="image_url"
          type="text"
          defaultValue={product?.image_url ?? ""}
          placeholder="https://… ou /images/products/…"
          className={fieldClassName}
        />
        {state.errors.image_url ? (
          <p className="mt-2 text-sm text-red-600">{state.errors.image_url}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
        <input
          name="is_available"
          type="checkbox"
          defaultChecked={product?.is_available ?? true}
          className="h-5 w-5 accent-[#D4AF37]"
        />
        <span className="text-sm font-semibold text-gray-800">Produit disponible</span>
      </label>

      {state.message ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending || categories.length === 0}
          className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (selectedFile ? "Téléversement en cours..." : "Enregistrement en cours...") : product ? "Enregistrer les modifications" : "Créer le produit"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
