import { notFound } from "next/navigation";
import CategoryForm from "@/app/admin/categories/CategoryForm";
import { updateCategory } from "@/app/admin/categories/actions";
import { getAdminCategory } from "@/lib/admin-category-data";

type EditCategoryPageProps = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) notFound();

  const { category, error } = await getAdminCategory(categoryId);
  if (!error && !category) notFound();
  const updateCategoryWithId = updateCategory.bind(null, categoryId);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
          <h1 className="mt-3 text-4xl font-bold">Modifier la catégorie</h1>
          <p className="mt-3 text-gray-600">Mettez à jour le nom de cette catégorie.</p>
          {error || !category ? (
            <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error ?? "Impossible de charger la catégorie."}
            </p>
          ) : (
            <CategoryForm action={updateCategoryWithId} category={category} />
          )}
        </div>
      </section>
    </main>
  );
}
