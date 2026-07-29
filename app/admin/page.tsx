import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin-dashboard-data";

const currency = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD" });

export default async function AdminPage() {
  const data = await getAdminDashboardData();
  const stats = [
    ["Produits", data.totalProducts],
    ["Produits disponibles", data.availableProducts],
    ["Catégories", data.totalCategories],
    ["Clients", data.totalCustomers],
    ["Commandes", data.totalOrders],
    ["Commandes en attente", data.pendingOrders],
    ["Chiffre d’affaires", currency.format(data.totalRevenue)],
  ];

  return (
    <main className="text-gray-900">
      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
        <h1 className="mt-3 text-4xl font-bold">Tableau de bord</h1>
        <p className="mt-3 text-gray-600">Vue d’ensemble de la boutique et des commandes.</p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistiques">
        {stats.map(([label, value]) => (
          <article key={label} className="rounded-[22px] border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Commandes récentes</h2><Link href="/admin/orders" className="text-sm font-semibold text-[#b38d21]">Tout voir</Link></div>
          <div className="mt-5 divide-y divide-gray-100">
            {data.recentOrders.length ? data.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div><p className="font-semibold">Commande #{order.id}</p><p className="text-sm text-gray-500">{order.profiles?.full_name ?? order.profiles?.email ?? "Client"}</p></div>
                <div className="text-right"><p className="font-semibold">{currency.format(Number(order.total_price))}</p><p className="text-sm text-[#b38d21]">{order.status}</p></div>
              </Link>
            )) : <p className="py-8 text-center text-gray-500">Aucune commande.</p>}
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Produits récents</h2><Link href="/admin/products" className="text-sm font-semibold text-[#b38d21]">Tout voir</Link></div>
          <div className="mt-5 divide-y divide-gray-100">
            {data.recentProducts.length ? data.recentProducts.map((product) => (
              <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div><p className="font-semibold">{product.name}</p><p className="text-sm text-gray-500">{product.categories?.name ?? "Sans catégorie"}</p></div>
                <div className="text-right"><p className="font-semibold">{currency.format(Number(product.base_price))}</p><p className={`text-sm ${product.is_available ? "text-emerald-600" : "text-gray-500"}`}>{product.is_available ? "Disponible" : "Indisponible"}</p></div>
              </Link>
            )) : <p className="py-8 text-center text-gray-500">Aucun produit.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
