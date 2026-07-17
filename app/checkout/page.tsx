"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, Home, Lock, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";

const orderItem = {
  name: "Royal Velvet Dream",
  image: "/images/products/cake1.jpg",
  options: "Ronde • 6 étages • Vanille & pistache",
  quantity: 1,
  subtotal: 620,
  delivery: 0,
};

const paymentMethods = [
  { id: "delivery", label: "Paiement à la livraison", description: "Payez à l'arrivée de votre commande." },
  { id: "card", label: "Carte bancaire", description: "Paiement sécurisé en ligne." },
  { id: "paypal", label: "PayPal", description: "Payer rapidement avec votre compte PayPal." },
];

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const total = orderItem.subtotal + orderItem.delivery;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-1 transition hover:text-[#D4AF37]">
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <span>/</span>
          <Link href="/cart" className="transition hover:text-[#D4AF37]">
            Panier
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Checkout</span>
        </div>

        <div className="mt-8 mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Confirmation
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Finaliser votre commande</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Complétez vos informations pour confirmer votre commande.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#FFF8E8] p-2 text-[#D4AF37]">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Informations client</h2>
                  <p className="text-sm text-gray-600">Vos coordonnées seront utilisées pour la livraison.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Nom complet</span>
                  <input className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" placeholder="Nom et prénom" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Téléphone</span>
                  <input className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" placeholder="+212 6XX XXXXX" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Email</span>
                  <input className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" placeholder="you@example.com" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Ville</span>
                  <input className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" placeholder="Casablanca" />
                </label>
                <label className="text-sm font-medium text-gray-700 md:col-span-2">
                  <span className="mb-2 block">Adresse</span>
                  <input className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" placeholder="Rue, avenue, bâtiment" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Code postal</span>
                  <input className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" placeholder="20000" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Date de livraison</span>
                  <input type="date" className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  <span className="mb-2 block">Heure de livraison</span>
                  <input type="time" className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 outline-none transition focus:border-[#D4AF37]" />
                </label>
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#FFF8E8] p-2 text-[#D4AF37]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Paiement</h2>
                  <p className="text-sm text-gray-600">Choisissez votre méthode préférée.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {paymentMethods.map((method) => {
                  const selected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-start justify-between rounded-[20px] border px-4 py-4 text-left transition duration-300 ${selected ? "border-[#D4AF37] bg-[#FFF8E8] shadow-sm" : "border-gray-200 bg-white hover:border-[#D4AF37]/40 hover:bg-[#FAFAFA]"}`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{method.label}</p>
                        <p className="mt-1 text-sm text-gray-600">{method.description}</p>
                      </div>
                      <div className={`mt-1 h-5 w-5 rounded-full border ${selected ? "border-[#D4AF37] bg-[#D4AF37]" : "border-gray-300"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#FFF8E8] p-2 text-[#D4AF37]">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Résumé de commande</h3>
                  <p className="text-sm text-gray-600">Votre gâteau personnalisé.</p>
                </div>
              </div>

              <div className="mt-6 flex gap-4 rounded-[20px] border border-gray-200 bg-[#FAFAFA] p-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[16px]">
                  <Image src={orderItem.image} alt={orderItem.name} fill sizes="96px" className="object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{orderItem.name}</h4>
                  <p className="mt-1 text-sm text-gray-600">{orderItem.options}</p>
                  <p className="mt-2 text-sm font-medium text-[#D4AF37]">Quantité : {orderItem.quantity}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900">{orderItem.subtotal} DH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Livraison</span>
                  <span className="font-semibold text-[#D4AF37]">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 pt-4" />
                <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{total} DH</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link href="/cart" className="flex items-center justify-center gap-2 rounded-full border border-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#FFF8E8]">
                  Retour au panier
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link href="/confirmation" className="flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]">
                  Confirmer la commande
                  <Lock className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-[16px] border border-gray-200 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700">
                <BadgeCheck className="h-4 w-4 text-[#D4AF37]" />
                Paiement sécurisé et livraison premium assurée.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
