import { notFound } from "next/navigation";
import SizeForm from "@/app/admin/options/sizes/SizeForm";
import { updateSize } from "@/app/admin/options/sizes/actions";
import { getAdminSize } from "@/lib/admin-size-data";

export default async function EditSizePage({ params }: { params: Promise<{ id: string }> }) {
  const sizeId = Number((await params).id);
  if (!Number.isInteger(sizeId) || sizeId <= 0) notFound();
  const { size, error } = await getAdminSize(sizeId);
  if (!error && !size) notFound();
  const updateSizeWithId = updateSize.bind(null, sizeId);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
          <h1 className="mt-3 text-4xl font-bold">Modifier la taille</h1>
          <p className="mt-3 text-gray-600">Mettez à jour le nom ou le prix supplémentaire.</p>
          {error || !size ? <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error ?? "Impossible de charger la taille."}</p> : <SizeForm action={updateSizeWithId} size={size} />}
        </div>
      </section>
    </main>
  );
}
