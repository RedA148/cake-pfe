"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { deleteColor } from "@/app/admin/options/colors/actions";
import type { ColorOption } from "@/lib/cake-options";

export default function ColorList({ initialColors }: { initialColors: ColorOption[] }) {
  const router = useRouter();
  const [colors, setColors] = useState(initialColors);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const filteredColors = useMemo(() => { const query = search.trim().toLocaleLowerCase("fr-FR"); return colors.filter((color) => color.name.toLocaleLowerCase("fr-FR").includes(query) || color.hex_color.toLocaleLowerCase("fr-FR").includes(query)); }, [search, colors]);

  function handleDelete(color: ColorOption) {
    if (!window.confirm(`Supprimer définitivement « ${color.name} » ?`)) return;
    startTransition(async () => {
      setMessage("");
      const result = await deleteColor(color.id);
      setMessage(result.message);
      if (!result.success) return;
      setColors((current) => current.filter((item) => item.id !== color.id));
      router.refresh();
    });
  }

  return <><label className="mt-8 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm"><Search className="h-5 w-5 text-[#D4AF37]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une couleur…" className="w-full bg-transparent text-sm outline-none" /></label>{message ? <p className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700" role="status">{message}</p> : null}{filteredColors.length === 0 ? <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-10 text-center shadow-sm"><p className="text-lg font-semibold">Aucune couleur trouvée</p><p className="mt-2 text-sm text-gray-600">Ajoutez une couleur ou modifiez votre recherche.</p></div> : <div className="mt-8 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm"><div className="divide-y divide-gray-100">{filteredColors.map((color) => <div key={color.id} className="flex items-center justify-between gap-4 p-5"><div className="flex min-w-0 items-center gap-4"><span className="h-11 w-11 shrink-0 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex_color }} /><div className="min-w-0"><p className="truncate font-semibold text-gray-900">{color.name}</p><p className="mt-1 text-sm text-gray-500">{color.hex_color}</p></div></div><div className="flex gap-2"><Link href={`/admin/options/colors/${color.id}/edit`} aria-label={`Modifier ${color.name}`} className="rounded-full border border-gray-200 p-2.5 text-gray-600 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"><Pencil className="h-4 w-4" /></Link><button type="button" disabled={pending} onClick={() => handleDelete(color)} aria-label={`Supprimer ${color.name}`} className="rounded-full border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>}</>;
}
