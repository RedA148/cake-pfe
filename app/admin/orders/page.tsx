import OrderList from "@/app/admin/orders/OrderList";
import { requireAdminUser } from "@/lib/admin-auth";
import { getAdminOrders } from "@/lib/order-data";

export default async function AdminOrdersPage() { const { supabase } = await requireAdminUser(); const orders = await getAdminOrders(supabase); return <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900"><section className="mx-auto max-w-7xl px-6 py-16"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p><h1 className="mt-3 text-4xl font-bold">Gestion des commandes</h1><OrderList orders={orders} /></section></main>; }
