"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ColorFormState } from "@/app/admin/options/colors/actions";
import type { ColorOption } from "@/lib/cake-options";

const initialState: ColorFormState = { message: "", errors: {} };

export default function ColorForm({ action, color }: { action: (state: ColorFormState, formData: FormData) => Promise<ColorFormState>; color?: ColorOption }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [hexColor, setHexColor] = useState(color?.hex_color ?? "#D4AF37");
  const previewColor = /^#[0-9a-f]{6}$/i.test(hexColor.trim()) ? hexColor : "#FFFFFF";
  return <form action={formAction} className="mt-8 space-y-6"><div><label htmlFor="name" className="text-sm font-semibold text-gray-800">Nom de la couleur</label><input id="name" name="name" defaultValue={color?.name ?? ""} required className="mt-2 w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />{state.errors.name ? <p className="mt-2 text-sm text-red-600">{state.errors.name}</p> : null}</div><div><label htmlFor="hex_color" className="text-sm font-semibold text-gray-800">Valeur hexadécimale</label><div className="mt-2 flex items-center gap-3"><span className="h-12 w-12 shrink-0 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: previewColor }} aria-label="Aperçu de la couleur" /><input id="hex_color" name="hex_color" value={hexColor} onChange={(event) => setHexColor(event.target.value)} required placeholder="#D4AF37" maxLength={7} className="w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm uppercase outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" /></div>{state.errors.hex_color ? <p className="mt-2 text-sm text-red-600">{state.errors.hex_color}</p> : null}</div>{state.message ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.message}</p> : null}<div className="flex flex-wrap gap-3"><button type="submit" disabled={pending} className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:opacity-50">{pending ? "Enregistrement…" : color ? "Enregistrer les modifications" : "Créer la couleur"}</button><Link href="/admin/options/colors" className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#D4AF37] hover:text-[#D4AF37]">Annuler</Link></div></form>;
}
