"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail, Phone, Sparkles, User } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_-25px_rgba(0,0,0,0.25)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[linear-gradient(135deg,#FFF8E8_0%,#ffffff_100%)] p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white px-4 py-2 text-sm font-semibold text-[#D4AF37] shadow-sm">
                <Sparkles className="h-4 w-4" />
                Délices de Bakri
              </div>

              <h1 className="mt-8 text-4xl font-bold text-gray-900 sm:text-5xl">
                Créez votre compte
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-8 text-gray-600">
                Rejoignez notre expérience premium pour commander vos gâteaux personnalisés en quelques secondes.
              </p>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <h2 className="text-2xl font-semibold text-gray-900">Créer un compte</h2>
                <p className="mt-2 text-sm text-gray-600">Remplissez les informations ci-dessous pour commencer.</p>

                <form className="mt-8 space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Nom</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <User className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input type="text" placeholder="Votre nom" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Email</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Mail className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input type="email" placeholder="you@example.com" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Téléphone</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Phone className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input type="tel" placeholder="+212 6XX XXXXX" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Mot de passe</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Lock className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input type="password" placeholder="••••••••" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]">
                    Créer un compte
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <Link href="/login" className="font-semibold text-[#D4AF37] transition hover:underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
