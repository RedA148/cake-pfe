import CategoryForm from "@/app/admin/categories/CategoryForm";
import { createCategory } from "@/app/admin/categories/actions";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function NewCategoryPage() {
  await requireAdminUser();

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
          <h1 className="mt-3 text-4xl font-bold">Ajouter une catégorie</h1>
          <p className="mt-3 text-gray-600">Créez une nouvelle collection pour les produits.</p>
          <CategoryForm action={createCategory} />
        </div>
      </section>
    </main>
  );
}
