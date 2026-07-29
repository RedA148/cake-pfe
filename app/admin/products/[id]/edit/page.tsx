import { notFound } from "next/navigation";
import ProductForm from "@/app/admin/products/ProductForm";
import { updateProduct } from "@/app/admin/products/actions";
import { getAdminCategories, getAdminProduct } from "@/lib/admin-product-data";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const [{ product, error }, { categories, error: categoryError }] = await Promise.all([
    getAdminProduct(productId),
    getAdminCategories(),
  ]);

  if (!error && !product) notFound();
  const updateProductWithId = updateProduct.bind(null, productId);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
          <h1 className="mt-3 text-4xl font-bold">Modifier le produit</h1>
          <p className="mt-3 text-gray-600">Mettez à jour les informations du produit.</p>

          {error || categoryError || !product ? (
            <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error ?? categoryError ?? "Impossible de charger le produit."}
            </p>
          ) : (
            <ProductForm
              action={updateProductWithId}
              categories={categories}
              product={product}
            />
          )}
        </div>
      </section>
    </main>
  );
}
