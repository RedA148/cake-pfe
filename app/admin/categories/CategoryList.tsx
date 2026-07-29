"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { AdminCategory } from "@/lib/admin-category-data";
import { deleteCategory } from "@/app/admin/categories/actions";

type CategoryListProps = { initialCategories: AdminCategory[] };

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, search]);

  function handleDelete(category: AdminCategory) {
    if (!window.confirm(`Supprimer définitivement « ${category.name} » ?`)) return;

    startTransition(async () => {
      setMessage("");
      const result = await deleteCategory(category.id);
      setMessage(result.message);
      if (!result.success) return;

      setCategories((current) => current.filter((item) => item.id !== category.id));
      router.refresh();
    });
  }

  return (
    <>
      <label className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-[#D4AF37]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une catégorie…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      {message ? (
        <p className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700" role="status">
          {message}
        </p>
      ) : null}

      {filteredCategories.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold">Aucune catégorie trouvée</p>
          <p className="mt-2 text-sm text-gray-600">Créez une catégorie ou modifiez votre recherche.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <article
              key={category.id}
              className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_15px_45px_-25px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  {category.slug ? <p className="mt-1 text-sm text-gray-500">/{category.slug}</p> : null}
                </div>
                <span className="rounded-full bg-[#FFF8E8] px-3 py-1 text-xs font-semibold text-[#D4AF37]">
                  {category.product_count} produit{category.product_count === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  aria-label={`Modifier ${category.name}`}
                  className="rounded-full border border-gray-200 p-2.5 text-gray-600 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(category)}
                  aria-label={`Supprimer ${category.name}`}
                  className="rounded-full border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
