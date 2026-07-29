"use client";

import { Pencil, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { CakeOption, OptionKind } from "@/lib/cake-options";
import { getColorPreview } from "@/lib/cake-options";
import { createOption, deleteOption, updateOption } from "@/app/admin/options/actions";

type OptionManagerProps = {
  kind: OptionKind;
  initialOptions: CakeOption[];
};

export default function OptionManager({ kind, initialOptions }: OptionManagerProps) {
  const [options, setOptions] = useState(initialOptions);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return options.filter((option) => option.name.toLowerCase().includes(query));
  }, [options, search]);

  function resetForm() {
    setName("");
    setPrice("0");
    setEditingId(null);
    setIsActive(true);
  }

  function beginEdit(option: CakeOption) {
    setEditingId(option.id);
    setName(option.name);
    setPrice("price" in option ? String(option.price) : "0");
    setIsActive(option.is_active ?? true);
    setMessage("");
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { name, price: kind === "sizes" ? Number(price) : undefined, is_active: isActive };

    startTransition(async () => {
      const result = editingId
        ? await updateOption(kind, editingId, input)
        : await createOption(kind, input);
      setMessage(result.message);
      if (!result.success) return;

      if (editingId) {
        setOptions((current) => current.map((option) =>
          option.id === editingId
            ? { ...option, name: name.trim(), is_active: isActive, ...(kind === "sizes" ? { price: Number(price) } : {}) }
            : option,
        ));
      } else {
        window.location.reload();
        return;
      }
      resetForm();
    });
  }

  function handleDelete(option: CakeOption) {
    if (!window.confirm(`Supprimer définitivement « ${option.name} » ?`)) return;
    startTransition(async () => {
      const result = await deleteOption(kind, option.id);
      setMessage(result.message);
      if (result.success) {
        setOptions((current) => current.filter((item) => item.id !== option.id));
        if (editingId === option.id) resetForm();
      }
    });
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <form onSubmit={submitForm} className="h-fit rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{editingId ? "Modifier l’option" : "Ajouter une option"}</h2>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-full border border-gray-200 p-2" aria-label="Annuler la modification">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <label htmlFor="option-name" className="mt-6 block text-sm font-semibold text-gray-800">Nom</label>
        <div className="mt-2 flex items-center gap-3">
          {kind === "colors" ? (
            <span className="h-10 w-10 shrink-0 rounded-full border border-gray-200" style={{ backgroundColor: getColorPreview(name) }} />
          ) : null}
          <input
            id="option-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>

        {kind === "sizes" ? (
          <>
            <label htmlFor="option-price" className="mt-5 block text-sm font-semibold text-gray-800">Prix supplémentaire (DH)</label>
            <input
              id="option-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
            />
          </>
        ) : null}

        <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-gray-800">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-[#D4AF37]" />
          Option active
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}
        </button>
      </form>

      <div>
        <label className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-[#D4AF37]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une option…" className="w-full bg-transparent text-sm outline-none" />
        </label>

        {message ? <p className="mt-4 rounded-2xl bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700" role="status">{message}</p> : null}

        {filteredOptions.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-gray-200 bg-white p-10 text-center">
            <p className="font-semibold">Aucune option trouvée</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {filteredOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    {kind === "colors" ? <span className="h-9 w-9 rounded-full border border-gray-200" style={{ backgroundColor: getColorPreview(option.name) }} /> : null}
                    <div>
                      <p className="font-semibold text-gray-900">{option.name}</p>
                      {"price" in option ? <p className="mt-1 text-sm text-[#D4AF37]">+{Number(option.price)} DH</p> : null}
                      <p className={`mt-1 text-xs font-semibold ${option.is_active ? "text-emerald-600" : "text-gray-400"}`}>{option.is_active ? "Active" : "Désactivée"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => beginEdit(option)} className="rounded-full border border-gray-200 p-2.5 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]" aria-label={`Modifier ${option.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={pending} onClick={() => handleDelete(option)} className="rounded-full border border-red-100 p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label={`Supprimer ${option.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
