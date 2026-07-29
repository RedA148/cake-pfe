"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const passwordSubmissionLock = useRef(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);

    try {
      const next = new URLSearchParams(window.location.search).get("next");
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (next?.startsWith("/")) callbackUrl.searchParams.set("next", next);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }

      if (!data.url) {
        throw new Error("Supabase did not return a Google OAuth redirect URL.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de démarrer la connexion Google.";
      console.error("Google OAuth failed", { message });
      setAuthError(message);
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordSubmissionLock.current) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setAuthError(null);
    if (!email || !password) {
      setAuthError("Saisissez votre email et votre mot de passe.");
      return;
    }

    passwordSubmissionLock.current = true;
    setIsPasswordLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Password login failed", {
          message: error.message,
          code: error.code,
          status: error.status,
        });
        setAuthError(
          error.code === "email_not_confirmed"
            ? "Votre email n’est pas encore confirmé. Vérifiez votre boîte de réception."
            : error.message,
        );
        return;
      }

      if (!data.user || !data.session) {
        setAuthError("La connexion n’a pas pu être établie. Veuillez réessayer.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Unable to load authenticated profile", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });
        setAuthError("Connexion réussie, mais votre profil n’a pas pu être chargé.");
        return;
      }

      const destination = profile?.role === "admin" ? "/admin" : "/orders";
      router.replace(destination);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
      console.error("Password login failed", { message });
      setAuthError(message);
    } finally {
      passwordSubmissionLock.current = false;
      setIsPasswordLoading(false);
    }
  };

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
                Bienvenue à nouveau
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-8 text-gray-600">
                Connectez-vous pour continuer votre expérience premium et gérer vos commandes personnalisées.
              </p>

              <div className="mt-8 rounded-[24px] border border-[#D4AF37]/20 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Accès sécurisé
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  Votre espace dédié vous permet de suivre vos créations et de retrouver vos préférences à tout moment.
                </p>
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <h2 className="text-2xl font-semibold text-gray-900">Connexion</h2>
                <p className="mt-2 text-sm text-gray-600">Entrez vos informations pour accéder à votre compte.</p>

                <form className="mt-8 space-y-4" onSubmit={handlePasswordSubmit}>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Email</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Mail className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        className="w-full bg-transparent outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-2 block">Mot de passe</span>
                    <div className="flex items-center rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 transition focus-within:border-[#D4AF37]">
                      <Lock className="mr-3 h-4 w-4 text-[#D4AF37]" />
                      <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-transparent outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </label>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                      Se souvenir de moi
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPasswordLoading ? "Connexion..." : "Se connecter"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {authError ? (
                  <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {authError}
                  </p>
                ) : null}

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FcGoogle className="h-5 w-5" />
                    {isGoogleLoading ? "Redirection vers Google..." : "Continuer avec Google"}
                  </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link href="/register" className="font-semibold text-[#D4AF37] transition hover:underline">
                    Créer un compte
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
