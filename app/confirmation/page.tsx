"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, PackageCheck, Sparkles } from "lucide-react";

const order = {
  number: "ORD-2026-0842",
  deliveryDate: "Samedi 18 juillet 2026",
  address: "12 Rue de la Paix, Casablanca, 20000",
  paymentMethod: "Carte bancaire",
  cakeName: "Royal Velvet Dream",
  cakeDetails: "Ronde • 6 étages • Vanille & pistache",
  image: "/images/products/cake1.jpg",
};

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_-25px_rgba(0,0,0,0.25)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[linear-gradient(135deg,#FFF8E8_0%,#ffffff_100%)] p-8 sm:p-10 lg:p-12">
              <div className="inline-flex rounded-full border border-[#D4AF37]/30 bg-white p-3 text-[#D4AF37] shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
                Commande confirmée
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600">
                Merci pour votre commande. Votre gâteau personnalisé est en cours de préparation et sera livré avec le plus grand soin.
              </p>

              <div className="mt-8 rounded-[24px] border border-[#D4AF37]/20 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.3em]">Commande</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{order.number}</p>
                <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-gray-900">Date estimée</p>
                    <p className="mt-1">{order.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Paiement</p>
                    <p className="mt-1">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalogue" className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]">
                  Retour au catalogue
                  <Home className="h-4 w-4" />
                </Link>
                <Link href="/catalogue" className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#FFF8E8]">
                  Voir le catalogue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-white p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#FFF8E8] p-2 text-[#D4AF37]">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Détails de livraison</h2>
                  <p className="text-sm text-gray-600">Votre commande arrivera avec élégance.</p>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-gray-200 bg-[#FAFAFA] p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[16px]">
                    <Image src={order.image} alt={order.cakeName} fill sizes="96px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.cakeName}</h3>
                    <p className="mt-1 text-sm text-gray-600">{order.cakeDetails}</p>
                    <div className="mt-3 rounded-full bg-[#FFF8E8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Livraison premium
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="rounded-[16px] border border-gray-200 bg-white p-3">
                    <p className="font-semibold text-gray-900">Adresse</p>
                    <p className="mt-1">{order.address}</p>
                  </div>
                  <div className="rounded-[16px] border border-gray-200 bg-white p-3">
                    <p className="font-semibold text-gray-900">Méthode de paiement</p>
                    <p className="mt-1">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
