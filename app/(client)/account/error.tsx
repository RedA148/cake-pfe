"use client";

export default function AccountError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 pt-24 text-gray-900">
      <div className="w-full max-w-xl rounded-[24px] border border-red-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Impossible de charger votre compte</h1>
        <p className="mt-3 text-gray-600">Une erreur est survenue. Veuillez réessayer.</p>
        <button type="button" onClick={unstable_retry} className="mt-6 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white">Réessayer</button>
      </div>
    </main>
  );
}
