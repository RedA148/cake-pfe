import { Suspense } from "react";
import CatalogueContent from "@/components/CatalogueContent";
import Navbar from "@/components/Navbar";
import { getActiveProducts } from "@/lib/product-data";

function CatalogueFallback() {
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
      </section>
    </main>
  );
}

export default async function CataloguePage() {
  const products = await getActiveProducts();

  return (
    <>
      <Navbar />
      <Suspense fallback={<CatalogueFallback />}>
        <CatalogueContent products={products} />
      </Suspense>
    </>
  );
}
