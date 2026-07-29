"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { slugifyCategoryName, type Category } from "@/lib/categories";
import { formatProductPrice, getProductBadge, type Product } from "@/lib/product";
import ProductImage from "@/components/ProductImage";

type CatalogueContentProps = {
  products: Product[];
  categories: Category[];
};

export default function CatalogueContent({ products, categories }: CatalogueContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);

  const updateCategoryScrollControls = useCallback(() => {
    const container = categoryScrollRef.current;
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollCategoriesLeft(container.scrollLeft > 1);
    setCanScrollCategoriesRight(container.scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    const container = categoryScrollRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(updateCategoryScrollControls);
    const resizeObserver = new ResizeObserver(updateCategoryScrollControls);
    resizeObserver.observe(container);
    if (container.firstElementChild) resizeObserver.observe(container.firstElementChild);
    container.addEventListener("scroll", updateCategoryScrollControls, { passive: true });
    window.addEventListener("resize", updateCategoryScrollControls);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener("scroll", updateCategoryScrollControls);
      window.removeEventListener("resize", updateCategoryScrollControls);
    };
  }, [categories, updateCategoryScrollControls]);

  function scrollCategories(direction: -1 | 1) {
    categoryScrollRef.current?.scrollBy({ left: direction * 250, behavior: "smooth" });
  }

  const activeCategoryId = useMemo(() => {
    const categoryParam = searchParams.get("category");
    const value = Number(categoryParam);
    if (Number.isInteger(value) && value > 0) return value;
    return categories.find(
      (category) => slugifyCategoryName(category.name) === categoryParam,
    )?.id ?? null;
  }, [categories, searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategoryId === null || product.category_id === activeCategoryId;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategoryId, products, search]);

  const handleCategoryChange = (nextCategoryId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategoryId) {
      params.set("category", String(nextCategoryId));
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
          <div className="flex flex-col gap-4">
            <label className="flex w-full items-center gap-3 rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-[#D4AF37]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un gâteau..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </label>

            <div className="relative w-full max-w-full overflow-hidden">
              <div
                ref={categoryScrollRef}
                className="no-scrollbar w-full max-w-full touch-pan-x overflow-x-auto overscroll-x-contain scroll-smooth"
                tabIndex={0}
                aria-label="Catégories du catalogue"
              >
                <div className="flex w-max min-w-full flex-nowrap gap-3">
                  {[{ id: null, name: "Tous" }, ...categories].map((category) => {
                    const isActive = category.id === activeCategoryId;
                    return (
                      <button
                        key={category.id ?? "all"}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 ${
                          isActive
                            ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {canScrollCategoriesLeft ? (
                <>
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/80 to-transparent" />
                  <button
                    type="button"
                    onClick={() => scrollCategories(-1)}
                    aria-label="Voir les catégories précédentes"
                    className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[#D4AF37] shadow-sm transition hover:border-[#D4AF37] hover:shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              {canScrollCategoriesRight ? (
                <>
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/80 to-transparent" />
                  <button
                    type="button"
                    onClick={() => scrollCategories(1)}
                    aria-label="Voir les catégories suivantes"
                    className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[#D4AF37] shadow-sm transition hover:border-[#D4AF37] hover:shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center text-lg text-gray-600">
              Aucun produit ne correspond à votre recherche.
            </p>
          ) : null}
          {filteredProducts.map((product) => {
            const badge = getProductBadge(product);

            return (
              <div
                key={product.id}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  {badge ? (
                    <span className="absolute left-4 top-4 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {badge}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <Link href={`/product/${product.id}`} className="block">
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  </Link>
                  <p className="mt-2 text-lg font-semibold text-[#D4AF37]">
                    {formatProductPrice(product.base_price)}
                  </p>
                  <Link
                    href={`/customize/${product.id}`}
                    className="mt-6 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-center text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
                  >
                    Personnaliser
                  </Link>
                </div>
              </div>
            );
          })}
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
