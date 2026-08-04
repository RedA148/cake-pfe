import { Suspense } from "react";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";

function FeaturedProductsFallback() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
          Chargement
        </p>
        <p className="mt-3 text-lg text-gray-600">Chargement des produits...</p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Suspense fallback={<FeaturedProductsFallback />}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
