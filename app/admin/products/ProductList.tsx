"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { Product, ProductCategory } from "@/lib/product";
import { formatProductPrice } from "@/lib/product";
import ProductImage from "@/components/ProductImage";
import {
  deleteProduct,
  setProductAvailability,
} from "@/app/admin/products/actions";

type ProductListProps = {
  initialProducts: Product[];
  categories: ProductCategory[];
};

export default function ProductList({ initialProducts, categories }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory = !categoryId || product.category_id === Number(categoryId);
      return matchesName && matchesCategory;
    });
  }, [categoryId, products, search]);

  function handleDelete(product: Product) {
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ?`)) return;

    startTransition(async () => {
      setMessage("");
      const result = await deleteProduct(product.id);
      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage(result.message);
      router.refresh();
    });
  }

  function handleAvailability(product: Product, nextValue: boolean) {
    const previousValue = product.is_available;
    setMessage("");
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, is_available: nextValue } : item,
      ),
    );

    startTransition(async () => {
      const result = await setProductAvailability(product.id, nextValue);
      if (!result.success) {
        setProducts((current) =>
          current.map((item) =>
            item.id === product.id
              ? { ...item, is_available: previousValue }
              : item,
          ),
        );
        setMessage(result.message);
        return;
      }

      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_15px_45px_-25px_rgba(0,0,0,0.25)] lg:flex-row lg:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3">
          <Search className="h-5 w-5 text-[#D4AF37]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par nom…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {message ? (
        <p className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700" role="status">
          {message}
        </p>
      ) : null}

      {filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Produit introuvable</p>
          <p className="mt-2 text-sm text-gray-600">Ajoutez un produit ou modifiez vos filtres.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#FFF8E8] text-xs uppercase tracking-[0.18em] text-gray-600">
                <tr>
                  <th className="px-5 py-4">Produit</th>
                  <th className="px-5 py-4">Catégorie</th>
                  <th className="px-5 py-4">Prix</th>
                  <th className="px-5 py-4">Disponibilité</th>
                  <th className="px-5 py-4">Créé le</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100">
                          <ProductImage
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.categories?.name ?? "Sans catégorie"}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#D4AF37]">
                      {formatProductPrice(product.base_price)}
                    </td>
                    <td className="px-5 py-4">
                      <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={product.is_available}
                          disabled={pending}
                          onChange={(event) => handleAvailability(product, event.target.checked)}
                          className="h-5 w-5 accent-[#D4AF37]"
                        />
                        {product.is_available ? "Disponible" : "Indisponible"}
                      </label>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                        new Date(product.created_at),
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          aria-label={`Modifier ${product.name}`}
                          className="rounded-full border border-gray-200 p-2.5 text-gray-600 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleDelete(product)}
                          aria-label={`Supprimer ${product.name}`}
                          className="rounded-full border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Link
        href="/admin/products/new"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#c79c1f] lg:hidden"
      >
        <Plus className="h-4 w-4" />
        Ajouter
      </Link>
    </>
  );
}
