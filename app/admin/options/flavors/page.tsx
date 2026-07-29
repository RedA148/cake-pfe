import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import FlavorList from "@/app/admin/options/flavors/FlavorList";
import { getAdminFlavors } from "@/lib/admin-flavor-data";

export default async function FlavorsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const [{ flavors, error }, { success }] = await Promise.all([getAdminFlavors(), searchParams]);
  const successMessage = success === "created" ? "Saveur créée avec succès." : success === "updated" ? "Saveur modifiée avec succès." : null;
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <Link href="/admin/options" className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:underline"><ArrowLeft className="h-4 w-4" /> Retour aux options</Link>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Saveurs</h1></div><Link href="/admin/options/flavors/new" className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f]"><Plus className="h-4 w-4" /> Ajouter une saveur</Link></div>
        {successMessage ? <p className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{successMessage}</p> : null}
        {error ? <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</p> : <FlavorList initialFlavors={flavors} />}
      </section>
    </main>
  );
}
