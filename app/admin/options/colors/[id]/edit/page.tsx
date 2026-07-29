import { notFound } from "next/navigation";
import ColorForm from "@/app/admin/options/colors/ColorForm";
import { updateColor } from "@/app/admin/options/colors/actions";
import { getAdminColor } from "@/lib/admin-color-data";

export default async function EditColorPage({ params }: { params: Promise<{ id: string }> }) {
  const colorId = Number((await params).id);
  if (!Number.isInteger(colorId) || colorId <= 0) notFound();
  const { color, error } = await getAdminColor(colorId);
  if (!error && !color) notFound();
  const updateColorWithId = updateColor.bind(null, colorId);
  return <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900"><section className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10"><div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p><h1 className="mt-3 text-4xl font-bold">Modifier la couleur</h1><p className="mt-3 text-gray-600">Mettez à jour le nom et la teinte de cette couleur.</p>{error || !color ? <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error ?? "Impossible de charger la couleur."}</p> : <ColorForm action={updateColorWithId} color={color} />}</div></section></main>;
}
