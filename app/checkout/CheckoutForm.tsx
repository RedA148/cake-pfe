"use client";

import { useState, useTransition } from "react";
import type { Address, CartItem, PaymentMethod } from "@/lib/commerce";
import { confirmOrder, createAddress } from "@/app/checkout/actions";

export default function CheckoutForm({ initialAddresses, items, customer }: { initialAddresses: Address[]; items: CartItem[]; customer: { name: string; email: string } }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState<number | null>(initialAddresses[0]?.id ?? null);
  const [payment, setPayment] = useState<PaymentMethod>("cash_on_delivery");
  const [showAddress, setShowAddress] = useState(initialAddresses.length === 0);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  function addAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createAddress({
        full_name: String(form.get("full_name") ?? ""), phone: String(form.get("phone") ?? ""),
        address: String(form.get("address") ?? ""), city: String(form.get("city") ?? ""),
        postal_code: String(form.get("postal_code") ?? ""),
      });
      setMessage(result.message);
      if (result.address) { setAddresses((current) => [...current, result.address!]); setAddressId(result.address.id); setShowAddress(false); }
    });
  }

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Informations client</h2>
          <p className="mt-2 text-gray-600">{customer.name} · {customer.email}</p>
        </section>
        <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Adresse de livraison</h2><button type="button" onClick={() => setShowAddress((value) => !value)} className="text-sm font-semibold text-[#D4AF37]">Ajouter une adresse</button></div>
          <div className="mt-5 space-y-3">{addresses.map((address) => <label key={address.id} className="flex cursor-pointer gap-3 rounded-2xl border border-gray-200 p-4"><input type="radio" checked={addressId === address.id} onChange={() => setAddressId(address.id)} /><span><b>{address.full_name}</b><br />{address.address}, {address.city} {address.postal_code}<br />{address.phone}</span></label>)}</div>
          {showAddress ? <form onSubmit={addAddress} className="mt-6 grid gap-3 sm:grid-cols-2">{[
            ["full_name","Nom complet"],["phone","Téléphone"],["address","Adresse"],["city","Ville"],["postal_code","Code postal"],
          ].map(([name,label]) => <label key={name} className={name === "address" ? "sm:col-span-2" : ""}><span className="text-sm font-medium">{label}</span><input name={name} required className="mt-1 w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3" /></label>)}<button disabled={pending} className="rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-white sm:col-span-2">Enregistrer l’adresse</button></form> : null}
        </section>
        <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">Mode de paiement</h2><div className="mt-4 space-y-3">{(["cash_on_delivery","card"] as PaymentMethod[]).map((method) => <label key={method} className="flex gap-3 rounded-2xl border border-gray-200 p-4"><input type="radio" checked={payment === method} onChange={() => setPayment(method)} /><span>{method === "cash_on_delivery" ? "Paiement à la livraison" : "Carte bancaire"}</span></label>)}</div></section>
      </div>
      <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-28"><h2 className="text-2xl font-semibold">Résumé</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.productName} × {item.quantity}</span><b>{item.totalPrice} DH</b></div>)}</div><div className="mt-5 flex justify-between border-t pt-5 text-lg font-semibold"><span>Total</span><span className="text-[#D4AF37]">{total} DH</span></div>{message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}<button type="button" disabled={pending || !addressId} onClick={() => startTransition(async () => { const result = await confirmOrder(addressId!, payment); if (!result.success) setMessage(result.message); })} className="mt-6 w-full rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Confirmation…" : "Confirmer la commande"}</button></aside>
    </div>
  );
}
