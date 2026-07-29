"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-white p-10 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">Une erreur est survenue</h2>
      <p className="mt-3 text-gray-600">Les données d’administration n’ont pas pu être chargées.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white">Réessayer</button>
    </div>
  );
}
