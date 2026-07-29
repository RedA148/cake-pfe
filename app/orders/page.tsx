import Link from "next/link";
import { requireUser } from "@/lib/user-auth";
import { getCustomerOrders } from "@/lib/order-data";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default async function OrdersPage() {
  const { supabase, user } = await requireUser("/orders");
  const orders = await getCustomerOrders(supabase, user.id);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Votre espace</p>
        <h1 className="mt-3 text-4xl font-bold">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-[24px] border border-gray-200 bg-white p-10 text-center">
            <p>Aucune commande pour le moment.</p>
            <Link href="/catalogue" className="mt-5 inline-block font-semibold text-[#D4AF37]">Découvrir le catalogue</Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {orders.map((order) => {
              const itemCount = (order.order_items ?? []).reduce((total, item) => total + item.quantity, 0);

              return (
                <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
                  <div>
                    <p className="font-bold">Commande #{order.id}</p>
                    <p className="mt-1 text-sm text-gray-500">{dateFormatter.format(new Date(order.created_at))}</p>
                    <p className="mt-1 text-sm text-gray-500">{itemCount} article{itemCount > 1 ? "s" : ""}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${order.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-[#FFF8E8] text-[#9a7613]"}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <p className="font-bold">{Number(order.total_price)} DH</p>
                  <Link href={`/orders/${order.id}`} className="rounded-full border border-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#9a7613] transition hover:bg-[#FFF8E8]">
                    Voir la commande
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
