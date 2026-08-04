"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const submissionLock = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name) {
      setErrorMessage("Le nom est obligatoire.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Saisissez une adresse email valide.");
      return;
    }
    if (!phone) {
      setErrorMessage("Le téléphone est obligatoire.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    submissionLock.current = true;
    setIsPending(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone },
        },
      });

      if (error) {
        console.error("Customer registration failed", {
          message: error.message,
          code: error.code,
          status: error.status,
        });
        setErrorMessage(error.message || "Impossible de créer le compte.");
        return;
      }

      if (!data.user) {
        setErrorMessage("Impossible de créer le compte. Veuillez réessayer.");
        return;
      }

      if (!data.session) {
        setSuccessMessage("Compte créé. Vérifiez votre email pour confirmer votre inscription.");
        form.reset();
        return;
      }

      const requestedDestination = new URLSearchParams(window.location.search).get("next");
      router.push(requestedDestination?.startsWith("/") ? requestedDestination : "/orders");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
      console.error("Customer registration failed", { message });
      setErrorMessage(message);
    } finally {
      submissionLock.current = false;
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_-25px_rgba(0,0,0,0.25)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[linear-gradient(135deg,#FFF8E8_0%,#ffffff_100%)] p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white px-4 py-2 text-sm font-semibold text-[#D4AF37] shadow-sm">
                <Image src="/images/brand-logo.png" alt="Délices de Bakri" width={1667} height={387} priority className="h-auto w-36" />
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

                <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Nom</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <User className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input name="name" type="text" autoComplete="name" required placeholder="Votre nom" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Email</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Mail className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Téléphone</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Phone className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input name="phone" type="tel" autoComplete="tel" required placeholder="+212 6XX XXXXX" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Mot de passe</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Lock className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input name="password" type="password" autoComplete="new-password" minLength={6} required placeholder="••••••••" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  {errorMessage ? (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                  ) : null}

                  {successMessage ? (
                    <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</p>
                  ) : null}

                  <button type="submit" disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f] disabled:cursor-not-allowed disabled:opacity-60">
                    {isPending ? "Création du compte..." : "Créer un compte"}
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
