"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ALL_CATEGORIES_OPTION,
  CATALOGUE_CATEGORIES,
  getCategoryLabelFromSlug,
  getCategorySlugFromLabel,
} from "@/lib/categories";
import { products } from "@/lib/products";

export default function CatalogueContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const activeCategory = useMemo(
    () => getCategoryLabelFromSlug(searchParams.get("category")),
    [searchParams],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORIES_OPTION.label ||
        product.category === activeCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const handleCategoryChange = (nextCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSlug = getCategorySlugFromLabel(nextCategory);

    if (nextSlug) {
      params.set("category", nextSlug);
    } else {
      params.delete("category");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Collection premium
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            Notre Catalogue
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Découvrez notre collection de gâteaux personnalisables pour toutes les occasions.
          </p>
        </div>

        <div className="mt-12 rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.25)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex flex-1 items-center gap-3 rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-[#D4AF37]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un gâteau..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              {CATALOGUE_CATEGORIES.map((category) => {
                const isActive = category.label === activeCategory;
                return (
                  <button
                    key={category.label}
                    onClick={() => handleCategoryChange(category.label)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 ${
                      isActive
                        ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {product.badge}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                </Link>
                <p className="mt-2 text-lg font-semibold text-[#D4AF37]">{product.price}</p>
                <Link
                  href={`/customize/${product.id}`}
                  className="mt-6 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-center text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
                >
                  Personnaliser
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                page === 1
                  ? "bg-[#D4AF37] text-white"
                  : "bg-white text-gray-700 hover:border hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              {page}
            </button>
          ))}

          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
