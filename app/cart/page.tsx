"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import ProductImage from "@/components/ProductImage";
import type { CartItem, GuestCartItem } from "@/lib/commerce";
import { clearCart, loadCart, removeCartItem, updateCartItemQuantity } from "@/app/cart/actions";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const hydrationStartedRef = useRef(false);

  useEffect(() => {
    if (hydrationStartedRef.current) return;
    hydrationStartedRef.current = true;

    async function hydrateCart() {
      let guestItems: GuestCartItem[] = [];
      try {
        const stored = window.localStorage.getItem("cart");
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed)) guestItems = parsed as GuestCartItem[];
      } catch {
        window.localStorage.removeItem("cart");
      }
      const result = await loadCart(guestItems);
      setItems(result.items);
      setAuthenticated(result.authenticated);
      setError(result.error ?? "");
      if (result.authenticated && !result.error) window.localStorage.removeItem("cart");
      setLoading(false);
    }
    void hydrateCart();
  }, []);

  function persistGuest(next: CartItem[]) {
    window.localStorage.setItem("cart", JSON.stringify(next));
  }

  function changeQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;
    const previous = items;
    const next = items.map((current) => current === item
      ? { ...current, quantity, totalPrice: current.unitPrice * quantity }
      : current);
    setItems(next);
    if (!authenticated) { persistGuest(next); return; }
    if (!item.id) return;
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id!, quantity);
      if (!result.success) { setItems(previous); setError(result.message); }
    });
  }

  function remove(item: CartItem) {
    const previous = items;
    const next = items.filter((current) => current !== item);
    setItems(next);
    if (!authenticated) { persistGuest(next); return; }
    if (!item.id) return;
    startTransition(async () => {
      const result = await removeCartItem(item.id!);
      if (!result.success) { setItems(previous); setError(result.message); }
    });
  }

  function clear() {
    if (!window.confirm("Vider complètement votre panier ?")) return;
    const previous = items;
    setItems([]);
    if (!authenticated) { window.localStorage.removeItem("cart"); return; }
    startTransition(async () => {
      const result = await clearCart();
      if (!result.success) { setItems(previous); setError(result.message); }
    });
  }

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] pt-24"><p className="text-gray-600">Chargement du panier…</p></main>;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Votre commande</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Mon Panier</h1>
        </div>

        {error ? <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</p> : null}

        {items.length === 0 ? (
          <div className="mt-12 rounded-[28px] border border-gray-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">Votre panier est vide</h2>
            <Link href="/catalogue" className="mt-6 inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white">Découvrir le catalogue</Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              {items.map((item, index) => (
                <article key={item.id ?? `${item.productId}-${index}`} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="relative h-48 w-full overflow-hidden rounded-[20px] bg-gray-100 sm:w-48">
                      <ProductImage src={item.productImage} alt={item.productName} fill sizes="192px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <div><h2 className="text-xl font-semibold">{item.productName}</h2>{!item.isAvailable ? <p className="mt-1 text-sm text-red-600">Produit indisponible</p> : null}</div>
                        <button type="button" onClick={() => remove(item)} disabled={pending} className="h-fit rounded-full border border-red-100 p-2.5 text-red-600" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <span>Forme : <b>{item.shape}</b></span><span>Taille : <b>{item.size}</b></span>
                        <span>Saveur : <b>{item.flavor}</b></span><span>Couleur : <b>{item.color}</b></span>
                      </div>
                      {item.customText ? <p className="mt-3 text-sm">Texte : {item.customText}</p> : null}
                      {item.instructions ? <p className="mt-2 text-sm text-gray-600">Instructions : {item.instructions}</p> : null}
                      {item.uploadedImage ? <a href={item.uploadedImage} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-[#D4AF37]">Voir l’image de référence</a> : null}
                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center rounded-full border border-gray-200 px-2">
                          <button type="button" onClick={() => changeQuantity(item, item.quantity - 1)} className="p-2 text-[#D4AF37]"><Minus className="h-4 w-4" /></button>
                          <span className="w-9 text-center font-semibold">{item.quantity}</span>
                          <button type="button" onClick={() => changeQuantity(item, item.quantity + 1)} className="p-2 text-[#D4AF37]"><Plus className="h-4 w-4" /></button>
                        </div>
                        <div className="text-right"><p className="text-xs text-gray-500">{item.unitPrice} DH / unité</p><p className="font-semibold text-[#D4AF37]">{item.totalPrice} DH</p></div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-2xl font-semibold">Résumé</h2>
              <div className="mt-6 flex justify-between border-t border-gray-200 pt-5 text-lg font-semibold"><span>Total</span><span className="text-[#D4AF37]">{total} DH</span></div>
              <Link href="/checkout" className={`mt-6 block rounded-full px-5 py-3 text-center text-sm font-semibold text-white ${items.some((item) => !item.isAvailable) ? "pointer-events-none bg-gray-400" : "bg-[#D4AF37]"}`}>Passer la commande</Link>
              <button type="button" onClick={clear} className="mt-3 w-full rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600">Vider le panier</button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
