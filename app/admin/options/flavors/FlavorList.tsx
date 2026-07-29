"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { deleteFlavor } from "@/app/admin/options/flavors/actions";
import type { FlavorOption } from "@/lib/cake-options";

export default function FlavorList({ initialFlavors }: { initialFlavors: FlavorOption[] }) {
  const router = useRouter();
  const [flavors, setFlavors] = useState(initialFlavors);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const filteredFlavors = useMemo(() => { const query = search.trim().toLocaleLowerCase("fr-FR"); return flavors.filter((flavor) => flavor.name.toLocaleLowerCase("fr-FR").includes(query)); }, [search, flavors]);

  function handleDelete(flavor: FlavorOption) {
    if (!window.confirm(`Supprimer définitivement « ${flavor.name} » ?`)) return;
    startTransition(async () => {
      setMessage("");
      const result = await deleteFlavor(flavor.id);
      setMessage(result.message);
      if (!result.success) return;
      setFlavors((current) => current.filter((item) => item.id !== flavor.id));
      router.refresh();
    });
  }

  return <><label className="mt-8 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm"><Search className="h-5 w-5 text-[#D4AF37]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une saveur…" className="w-full bg-transparent text-sm outline-none" /></label>{message ? <p className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700" role="status">{message}</p> : null}{filteredFlavors.length === 0 ? <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-10 text-center shadow-sm"><p className="text-lg font-semibold">Aucune saveur trouvée</p><p className="mt-2 text-sm text-gray-600">Ajoutez une saveur ou modifiez votre recherche.</p></div> : <div className="mt-8 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"><div className="divide-y divide-gray-100">{filteredFlavors.map((flavor) => <div key={flavor.id} className="flex items-center justify-between gap-4 p-5"><p className="font-semibold text-gray-900">{flavor.name}</p><div className="flex gap-2"><Link href={`/admin/options/flavors/${flavor.id}/edit`} aria-label={`Modifier ${flavor.name}`} className="rounded-full border border-gray-200 p-2.5 text-gray-600 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"><Pencil className="h-4 w-4" /></Link><button type="button" disabled={pending} onClick={() => handleDelete(flavor)} aria-label={`Supprimer ${flavor.name}`} className="rounded-full border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>}</>;
}
