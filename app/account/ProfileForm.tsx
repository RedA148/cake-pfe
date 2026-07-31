"use client";

import { useActionState, useState } from "react";
import { updateAccountProfile, type ProfileActionState } from "@/app/account/actions";

const initialProfileActionState: ProfileActionState = {
  success: false,
  message: "",
  errors: {},
};

type ProfileFormProps = {
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
};

export default function ProfileForm({ fullName, email, phone, createdAt }: ProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateAccountProfile, initialProfileActionState);

  return (
    <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Informations personnelles</h2>
        <button type="button" onClick={() => setEditing((current) => !current)} className="rounded-full border border-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#9a7613] transition hover:bg-[#FFF8E8]">
          {editing ? "Annuler" : "Modifier mes informations"}
        </button>
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><dt className="text-sm text-gray-500">Nom complet</dt><dd className="mt-1 font-semibold">{fullName || "Non renseigné"}</dd></div>
        <div><dt className="text-sm text-gray-500">Email</dt><dd className="mt-1 break-all font-semibold">{email}</dd></div>
        <div><dt className="text-sm text-gray-500">Téléphone</dt><dd className="mt-1 font-semibold">{phone || "Non renseigné"}</dd></div>
        <div><dt className="text-sm text-gray-500">Date d’inscription</dt><dd className="mt-1 font-semibold">{createdAt}</dd></div>
      </dl>

      {state.message ? (
        <p role={state.success ? "status" : "alert"} className={`mt-6 rounded-2xl px-4 py-3 text-sm ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      ) : null}

      {editing ? (
        <form action={formAction} className="mt-6 space-y-5 border-t border-gray-100 pt-6">
          <div>
            <label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Nom complet</label>
            <input id="full_name" name="full_name" defaultValue={fullName} required className="mt-2 w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" />
            {state.errors.full_name ? <p className="mt-2 text-sm text-red-600">{state.errors.full_name}</p> : null}
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
            <input id="email" value={email} readOnly className="mt-2 w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 outline-none" />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Téléphone</label>
            <input id="phone" name="phone" type="tel" defaultValue={phone} required className="mt-2 w-full rounded-2xl border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" />
            {state.errors.phone ? <p className="mt-2 text-sm text-red-600">{state.errors.phone}</p> : null}
          </div>
          <button type="submit" disabled={pending} className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
