import { notFound } from "next/navigation";
import FlavorForm from "@/app/admin/options/flavors/FlavorForm";
import { updateFlavor } from "@/app/admin/options/flavors/actions";
import { getAdminFlavor } from "@/lib/admin-flavor-data";

export default async function EditFlavorPage({ params }: { params: Promise<{ id: string }> }) {
  const flavorId = Number((await params).id);
  if (!Number.isInteger(flavorId) || flavorId <= 0) notFound();
  const { flavor, error } = await getAdminFlavor(flavorId);
  if (!error && !flavor) notFound();
  const updateFlavorWithId = updateFlavor.bind(null, flavorId);
  return <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900"><section className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10"><div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p><h1 className="mt-3 text-4xl font-bold">Modifier la saveur</h1><p className="mt-3 text-gray-600">Mettez à jour le nom de cette saveur.</p>{error || !flavor ? <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error ?? "Impossible de charger la saveur."}</p> : <FlavorForm action={updateFlavorWithId} flavor={flavor} />}</div></section></main>;
}
