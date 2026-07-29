import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomerById } from "@/lib/admin-customer-data";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const currency = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();
  const initials = customer.full_name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CL";

  return (
    <main className="text-gray-900">
      <Link href="/admin/customers" className="text-sm font-semibold text-[#b38d21]">← Retour aux clients</Link>
      <section className="mt-4 rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#FFF8E8] bg-cover bg-center text-xl font-bold text-[#9a7613]" style={customer.avatar_url ? { backgroundImage: `url(${customer.avatar_url})` } : undefined} role="img" aria-label={customer.avatar_url ? `Avatar de ${customer.full_name ?? "ce client"}` : `Initiales de ${customer.full_name ?? "ce client"}`}>
            {customer.avatar_url ? <span className="sr-only">{initials}</span> : initials}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Profil client</p>
            <h1 className="mt-3 text-3xl font-bold">{customer.full_name ?? "Client sans nom"}</h1>
            <p className="mt-2 text-gray-600">{customer.email ?? "Email non renseigné"}{customer.phone ? ` · ${customer.phone}` : ""}</p>
            <p className="mt-2 text-sm text-gray-500">Inscrit le {dateFormatter.format(new Date(customer.created_at))} · Rôle : {customer.role === "customer" ? "Client" : customer.role}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[["Commandes", customer.stats.totalOrders], ["En attente", customer.stats.pendingOrders], ["Livrées", customer.stats.deliveredOrders], ["Annulées", customer.stats.cancelledOrders]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#FFF8E8] px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#9a7613]">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}
          <div className="rounded-2xl bg-[#FFF8E8] px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#9a7613]">Total dépensé</p><p className="mt-1 text-xl font-bold">{currency.format(customer.stats.totalSpent)}</p></div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Adresses enregistrées</h2><div className="mt-4 space-y-3">{customer.addresses.length ? customer.addresses.map((address) => <article key={address.id} className="rounded-2xl bg-[#FAFAFA] p-4 text-sm leading-6"><p className="font-semibold">{address.full_name}</p><p>{address.address}</p><p>{address.postal_code} {address.city}</p><p>{address.phone}</p><p className="mt-2 text-xs text-gray-500">Ajoutée le {dateFormatter.format(new Date(address.created_at))}</p></article>) : <p className="py-6 text-center text-gray-500">Aucune adresse enregistrée.</p>}</div></section>
        <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Historique des commandes</h2><div className="mt-4 divide-y divide-gray-100">{customer.orders.length ? customer.orders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-semibold">Commande #{order.id}</p><p className="text-sm text-gray-500">{dateFormatter.format(new Date(order.created_at))} · {order.itemCount} article{order.itemCount > 1 ? "s" : ""}</p></div><div className="text-sm sm:text-right"><p className="font-semibold">{currency.format(Number(order.total_price))}</p><p className="text-gray-500">{order.payment_method === "card" ? "Carte" : "Paiement à la livraison"}</p></div><span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${order.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-[#FFF8E8] text-[#9a7613]"}`}>{ORDER_STATUS_LABELS[order.status]}</span></Link>) : <p className="py-6 text-center text-gray-500">Aucune commande.</p>}</div></section>
      </div>
    </main>
  );
}
