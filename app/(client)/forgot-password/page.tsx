"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const confirmationMessage = "Si cette adresse email est associée à un compte, un lien de réinitialisation vous sera envoyé.";

export default function ForgotPasswordPage() {
  const submissionLock = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Saisissez une adresse email valide.");
      return;
    }

    submissionLock.current = true;
    setIsPending(true);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/reset-password");
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl.toString(),
      });

      if (error) {
        console.error("Password reset email failed", { message: error.message, code: error.code, status: error.status });
        setErrorMessage("Impossible d’envoyer le lien pour le moment. Veuillez réessayer.");
        return;
      }

      setSuccessMessage(confirmationMessage);
    } catch (error) {
      console.error("Password reset email failed", {
        message: error instanceof Error ? error.message : "Unknown password reset error",
      });
      setErrorMessage("Impossible d’envoyer le lien pour le moment. Veuillez réessayer.");
    } finally {
      submissionLock.current = false;
      setIsPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_-25px_rgba(0,0,0,0.25)]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[linear-gradient(135deg,#FFF8E8_0%,#ffffff_100%)] p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-white px-4 py-2 shadow-sm">
                <Image src="/images/brand-logo.png" alt="Délices de Bakri" width={1667} height={387} priority className="h-auto w-36" />
              </div>
              <h1 className="mt-8 text-4xl font-bold sm:text-5xl">Mot de passe oublié</h1>
              <p className="mt-4 max-w-lg text-lg leading-8 text-gray-600">
                Indiquez votre adresse email. Nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe.
              </p>
              <div className="mt-8 rounded-[24px] border border-[#D4AF37]/20 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Lien sécurisé</p>
                <p className="mt-3 text-sm leading-7 text-gray-600">Le lien reçu par email sera utilisable pour accéder à la page de réinitialisation.</p>
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <h2 className="text-2xl font-semibold">Réinitialiser votre accès</h2>
                <p className="mt-2 text-sm text-gray-600">Saisissez l’adresse email associée à votre compte.</p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Adresse email</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Mail className="mr-3 h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                      <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="w-full bg-transparent outline-none placeholder:text-gray-400" />
                    </div>
                  </label>

                  {errorMessage ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}
                  {successMessage ? <p role="status" className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">{successMessage}</p> : null}

                  <button type="submit" disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:cursor-not-allowed disabled:opacity-60">
                    {isPending ? "Envoi..." : "Envoyer le lien"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>

                <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#D4AF37] transition hover:underline hover:underline-offset-4">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
