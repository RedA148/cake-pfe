import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/user-auth";
import { getOrder } from "@/lib/order-data";

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id); if (!Number.isInteger(id) || id <= 0) notFound();
  const { supabase, user } = await requireUser(`/orders/confirmation/${id}`);
  const order = await getOrder(supabase, id, user.id); if (!order) notFound();
  return <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 pt-24 text-center text-gray-900"><div className="w-full max-w-2xl rounded-[32px] border border-gray-200 bg-white p-10 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Commande confirmée</p><h1 className="mt-4 text-4xl font-bold">Merci pour votre commande</h1><p className="mt-4 text-gray-600">Commande #{order.id}</p><p className="mt-2 text-2xl font-semibold text-[#D4AF37]">{Number(order.total_price)} DH</p><p className="mt-2">{order.payment_method === "card" ? "Carte bancaire" : "Paiement à la livraison"}</p><Link href={`/orders/${order.id}`} className="mt-8 inline-block rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white">Voir la commande</Link></div></main>;
}
