"use client";

export default function CustomersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="rounded-[24px] border border-red-100 bg-white p-10 text-center shadow-sm"><p className="font-semibold text-red-700">Impossible de charger les clients.</p><button type="button" onClick={reset} className="mt-5 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-white">Réessayer</button></div>;
}
