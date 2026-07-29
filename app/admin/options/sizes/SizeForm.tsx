"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { SizeFormState } from "@/app/admin/options/sizes/actions";
import type { SizeOption } from "@/lib/cake-options";

const initialState: SizeFormState = { message: "", errors: {} };

export default function SizeForm({ action, size }: { action: (state: SizeFormState, formData: FormData) => Promise<SizeFormState>; size?: SizeOption }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldClass = "mt-2 w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15";
  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div><label htmlFor="name" className="text-sm font-semibold text-gray-800">Nom de la taille</label><input id="name" name="name" defaultValue={size?.name ?? ""} required className={fieldClass} />{state.errors.name ? <p className="mt-2 text-sm text-red-600">{state.errors.name}</p> : null}</div>
      <div><label htmlFor="price" className="text-sm font-semibold text-gray-800">Prix supplémentaire (DH)</label><input id="price" name="price" type="number" min="0" step="0.01" defaultValue={size?.price ?? ""} required className={fieldClass} />{state.errors.price ? <p className="mt-2 text-sm text-red-600">{state.errors.price}</p> : null}</div>
      {state.message ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.message}</p> : null}
      <div className="flex flex-wrap gap-3"><button type="submit" disabled={pending} className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:opacity-50">{pending ? "Enregistrement…" : size ? "Enregistrer les modifications" : "Créer la taille"}</button><Link href="/admin/options/sizes" className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">Annuler</Link></div>
    </form>
  );
}
