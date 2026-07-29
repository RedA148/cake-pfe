"use client";

import { useEffect } from "react";

type AdminProductsErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AdminProductsError({ error, unstable_retry }: AdminProductsErrorProps) {
  useEffect(() => {
    console.error("Admin products page failed", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8 lg:px-10">
        <div className="rounded-[28px] border border-red-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Impossible de charger les produits</h1>
          <p className="mt-3 text-gray-600">Une erreur inattendue s’est produite.</p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c79c1f]"
          >
            Réessayer
          </button>
        </div>
      </section>
    </main>
  );
}
