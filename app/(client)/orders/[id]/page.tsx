import Link from "next/link";
import { requireUser } from "@/lib/user-auth";
import { getOrder } from "@/lib/order-data";
import OrderStatusProgress from "@/components/OrderStatusProgress";

function OrderMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-3 text-gray-600">{message}</p>
          <Link href="/orders" className="mt-6 inline-block rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white">
            Retour à mes commandes
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const receivedParams = await params;
  const id = Number(receivedParams.id);
  console.info("[OrderPage] Dynamic route", { params: receivedParams, id });

  if (!Number.isInteger(id) || id <= 0) {
    return <OrderMessage title="Commande introuvable" message="Le numéro de commande est invalide." />;
  }

  const { supabase, user } = await requireUser(`/orders/${id}`);
  console.info("[OrderPage] Authenticated user", { userId: user.id, email: user.email });

  // Supabase RLS remains the primary access control. The explicit comparison
  // also handles an ownership mismatch whenever the row is visible.
  const order = await getOrder(supabase, id);
  if (!order) {
    return <OrderMessage title="Commande introuvable" message="Cette commande n’existe pas ou n’est plus disponible." />;
  }
  if (order.profile_id !== user.id) {
    return <OrderMessage title="Accès non autorisé" message="Cette commande appartient à un autre utilisateur." />;
  }

  const address = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses;
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(order.created_at));

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Link href="/orders" className="mb-6 inline-flex items-center text-sm font-semibold text-gray-600 transition hover:text-[#9a7613]">
          ← Retour à mes commandes
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Commande #{order.id}</p>
        <h1 className="mt-3 text-4xl font-bold">Détail de la commande</h1>
        <p className="mt-3 text-sm text-gray-600">Passée le {date}</p>
        <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <OrderStatusProgress status={order.status} />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {order.order_items?.map((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              const customization = Array.isArray(item.cake_customizations) ? item.cake_customizations[0] : item.cake_customizations;
              return (
                <article key={item.id} className="rounded-[24px] border border-gray-200 bg-white p-6">
                  <h2 className="text-xl font-semibold">{item.snapshot?.product_name ?? product?.name ?? `Produit #${item.product_id}`}</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {[item.snapshot?.shape, item.snapshot?.size, item.snapshot?.flavor, item.snapshot?.color].filter(Boolean).join(" · ")}
                  </p>
                  {(item.snapshot?.custom_text ?? customization?.custom_text) ? <p className="mt-2 text-sm">Texte : {item.snapshot?.custom_text ?? customization?.custom_text}</p> : null}
                  {(item.snapshot?.instructions ?? customization?.instructions) ? <p className="mt-2 text-sm">Instructions : {item.snapshot?.instructions ?? customization?.instructions}</p> : null}
                  {(item.snapshot?.image_url ?? customization?.image_url) ? (
                    <a href={(item.snapshot?.image_url ?? customization?.image_url)!} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-[#D4AF37]">
                      Image de référence
                    </a>
                  ) : null}
                  <p className="mt-4 font-semibold">{item.quantity} × {Number(item.price)} DH</p>
                </article>
              );
            })}
          </div>
          <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-6">
            <p>Paiement : <b>{order.payment_method === "card" ? "Carte" : "À la livraison"}</b></p>
            {address ? (
              <div className="mt-5 border-t pt-5">
                <b>Livraison</b>
                <p className="mt-2 text-sm">
                  {address.full_name}<br />
                  {address.address}<br />
                  {address.city} {address.postal_code}<br />
                  {address.phone}
                </p>
              </div>
            ) : null}
            <p className="mt-5 border-t pt-5 text-xl font-semibold">
              Total : <span className="text-[#D4AF37]">{Number(order.total_price)} DH</span>
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
