"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { deleteSize } from "@/app/admin/options/sizes/actions";
import type { SizeOption } from "@/lib/cake-options";

export default function SizeList({ initialSizes }: { initialSizes: SizeOption[] }) {
  const router = useRouter();
  const [sizes, setSizes] = useState(initialSizes);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const filteredSizes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr-FR");
    return sizes.filter((size) => size.name.toLocaleLowerCase("fr-FR").includes(query));
  }, [search, sizes]);

  function handleDelete(size: SizeOption) {
    if (!window.confirm(`Supprimer définitivement « ${size.name} » ?`)) return;
    startTransition(async () => {
      setMessage("");
      const result = await deleteSize(size.id);
      setMessage(result.message);
      if (!result.success) return;
      setSizes((current) => current.filter((item) => item.id !== size.id));
      router.refresh();
    });
  }

  return (
    <>
      <label className="mt-8 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-[#D4AF37]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une taille…" className="w-full bg-transparent text-sm outline-none" />
      </label>
      {message ? <p className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700" role="status">{message}</p> : null}
      {filteredSizes.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-10 text-center shadow-sm"><p className="text-lg font-semibold">Aucune taille trouvée</p><p className="mt-2 text-sm text-gray-600">Ajoutez une taille ou modifiez votre recherche.</p></div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {filteredSizes.map((size) => (
              <div key={size.id} className="flex items-center justify-between gap-4 p-5">
                <div><p className="font-semibold text-gray-900">{size.name}</p><p className="mt-1 text-sm font-semibold text-[#D4AF37]">+{Number(size.price)} DH</p></div>
                <div className="flex gap-2">
                  <Link href={`/admin/options/sizes/${size.id}/edit`} aria-label={`Modifier ${size.name}`} className="rounded-full border border-gray-200 p-2.5 text-gray-600 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"><Pencil className="h-4 w-4" /></Link>
                  <button type="button" disabled={pending} onClick={() => handleDelete(size)} aria-label={`Supprimer ${size.name}`} className="rounded-full border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
