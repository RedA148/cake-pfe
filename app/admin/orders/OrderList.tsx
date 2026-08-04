"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/lib/commerce";

const statuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

export default function OrderList({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filtered = useMemo(() => orders.filter((order) => {
    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
    const haystack = `${order.id} ${profile?.full_name ?? ""} ${profile?.email ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (!status || order.status === status);
  }), [orders, search, status]);

  return <>
    <div className="mt-8 flex flex-col gap-3 rounded-[24px] border border-gray-200 bg-white p-5 sm:flex-row">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, client ou email…" className="flex-1 rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3" />
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-full border border-gray-200 px-4"><option value="">Tous les statuts</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select>
    </div>
    {filtered.length === 0 ? <p className="mt-8 rounded-[24px] bg-white p-10 text-center">Aucune commande trouvée.</p> : <div className="mt-8 space-y-4">{filtered.map((order) => {
      const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
      return <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
        <div><b>#{order.id} · {profile?.full_name ?? "Client"}</b><p className="text-sm text-gray-500">{profile?.email}</p></div>
        <span>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(order.created_at))}</span><span className="rounded-full bg-[#FFF8E8] px-3 py-1 text-[#D4AF37]">{order.status}</span><b>{Number(order.total_price)} DH</b>
      </Link>;
    })}</div>}
  </>;
}
