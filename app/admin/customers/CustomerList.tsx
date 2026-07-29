"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminCustomer } from "@/lib/admin-customer-data";

const currency = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default function CustomerList({ customers }: { customers: AdminCustomer[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => `${customer.full_name ?? ""} ${customer.email ?? ""} ${customer.phone ?? ""}`.toLowerCase().includes(query));
  }, [customers, search]);

  return (
    <>
      <label className="mt-8 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
        <Search className="h-5 w-5 text-[#D4AF37]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par nom, email ou téléphone…" className="w-full bg-transparent text-sm outline-none" />
      </label>
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-gray-200 bg-white p-10 text-center text-gray-500">Aucun client trouvé.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {filtered.map((customer) => (
              <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="grid gap-3 p-5 transition hover:bg-[#FFFDF7] sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
                <div><p className="font-semibold text-gray-900">{customer.full_name ?? "Client sans nom"}</p><p className="mt-1 text-sm text-gray-500">{customer.email ?? "Email non renseigné"}{customer.phone ? ` · ${customer.phone}` : ""}</p></div>
                <div className="text-sm text-gray-600 sm:text-right"><p>Inscrit le</p><p className="font-medium text-gray-900">{dateFormatter.format(new Date(customer.created_at))}</p></div>
                <div className="text-sm text-gray-600 sm:text-right"><p>{customer.orderCount} commande{customer.orderCount > 1 ? "s" : ""}</p><p className="font-semibold text-gray-900">{currency.format(customer.totalSpent)}</p></div>
                <span className="text-sm font-semibold text-[#b38d21]">Voir le profil</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
