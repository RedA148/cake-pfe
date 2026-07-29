"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "Tableau de bord"],
  ["/admin/products", "Produits"],
  ["/admin/categories", "Catégories"],
  ["/admin/options", "Options"],
  ["/admin/orders", "Commandes"],
  ["/admin/customers", "Clients"],
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation d’administration" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">
      {links.map(([href, label]) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[#D4AF37] text-white" : "text-gray-700 hover:bg-[#FFF8E8] hover:text-[#9a7613]"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
