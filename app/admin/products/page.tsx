import Link from "next/link";
import { Plus } from "lucide-react";
import ProductList from "@/app/admin/products/ProductList";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-product-data";

type AdminProductsPageProps = {
  searchParams: Promise<{ success?: string }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [{ products, error }, { categories, error: categoryError }] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);
  const { success } = await searchParams;
  const successMessage =
    success === "created"
      ? "Produit créé avec succès."
      : success === "updated"
        ? "Produit modifié avec succès."
        : null;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Gestion des produits</h1>
            <p className="mt-3 text-lg text-gray-600">Gérez le catalogue, les prix et la disponibilité.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="hidden items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Link>
        </div>

        {successMessage ? (
          <p className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            {successMessage}
          </p>
        ) : null}

        {error || categoryError ? (
          <div className="mt-8 rounded-[24px] border border-red-100 bg-white p-8 text-center shadow-sm" role="alert">
            <p className="font-semibold text-red-700">{error ?? categoryError}</p>
          </div>
        ) : (
          <div className="mt-8">
            <ProductList initialProducts={products} categories={categories} />
          </div>
        )}
      </section>
    </main>
  );
}
