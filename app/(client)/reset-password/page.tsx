"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const submissionLock = useRef(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmation) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    submissionLock.current = true;
    setIsPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("Password update failed", { message: error.message, code: error.code, status: error.status });
        setErrorMessage(error.code === "session_not_found"
          ? "Ce lien est invalide ou a expiré. Demandez un nouveau lien de réinitialisation."
          : "Impossible de réinitialiser le mot de passe. Le lien est peut-être expiré.");
        return;
      }

      await supabase.auth.signOut();
      form.reset();
      setSuccessMessage("Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.");
    } catch (error) {
      console.error("Password update failed", { message: error instanceof Error ? error.message : "Unknown password update error" });
      setErrorMessage("Impossible de réinitialiser le mot de passe. Veuillez réessayer.");
    } finally {
      submissionLock.current = false;
      setIsPending(false);
    }
  };

  const PasswordVisibilityIcon = showPasswords ? EyeOff : Eye;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_25px_80px_-25px_rgba(0,0,0,0.25)]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[linear-gradient(135deg,#FFF8E8_0%,#ffffff_100%)] p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-white px-4 py-2 shadow-sm">
                <Image src="/images/brand-logo.png" alt="Délices de Bakri" width={1667} height={387} priority className="h-auto w-36" />
              </div>
              <h1 className="mt-8 text-4xl font-bold sm:text-5xl">Nouveau mot de passe</h1>
              <p className="mt-4 max-w-lg text-lg leading-8 text-gray-600">Choisissez un nouveau mot de passe pour sécuriser votre espace Délices de Bakri.</p>
              <div className="mt-8 rounded-[24px] border border-[#D4AF37]/20 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Votre sécurité</p>
                <p className="mt-3 text-sm leading-7 text-gray-600">Utilisez au moins 6 caractères et choisissez un mot de passe difficile à deviner.</p>
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <h2 className="text-2xl font-semibold">Réinitialiser le mot de passe</h2>
                <p className="mt-2 text-sm text-gray-600">Saisissez et confirmez votre nouveau mot de passe.</p>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Nouveau mot de passe</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Lock className="mr-3 h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                      <input name="password" type={showPasswords ? "text" : "password"} autoComplete="new-password" minLength={6} required className="min-w-0 flex-1 bg-transparent outline-none" />
                      <button type="button" onClick={() => setShowPasswords((visible) => !visible)} className="ml-2 rounded-full p-1 text-gray-500 transition hover:text-[#D4AF37]" aria-label={showPasswords ? "Masquer les mots de passe" : "Afficher les mots de passe"}>
                        <PasswordVisibilityIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Confirmer le nouveau mot de passe</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Lock className="mr-3 h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                      <input name="passwordConfirmation" type={showPasswords ? "text" : "password"} autoComplete="new-password" minLength={6} required className="min-w-0 flex-1 bg-transparent outline-none" />
                      <button type="button" onClick={() => setShowPasswords((visible) => !visible)} className="ml-2 rounded-full p-1 text-gray-500 transition hover:text-[#D4AF37]" aria-label={showPasswords ? "Masquer les mots de passe" : "Afficher les mots de passe"}>
                        <PasswordVisibilityIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </label>

                  {errorMessage ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{errorMessage}</p> : null}
                  {successMessage ? <p role="status" className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">{successMessage}</p> : null}

                  <button type="submit" disabled={isPending || Boolean(successMessage)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:cursor-not-allowed disabled:opacity-60">
                    {isPending ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>

                <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#D4AF37] transition hover:underline hover:underline-offset-4">Retour à la connexion</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
