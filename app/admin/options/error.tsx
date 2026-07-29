"use client";

import { useEffect } from "react";

export default function AdminOptionsError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error("Admin cake options page failed", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-center text-gray-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-[28px] border border-red-100 bg-white p-8">
          <h1 className="text-3xl font-bold">Impossible de charger les options</h1>
          <button type="button" onClick={() => unstable_retry()} className="mt-6 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white">Réessayer</button>
        </div>
      </section>
    </main>
  );
}
