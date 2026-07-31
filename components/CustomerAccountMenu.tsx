"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Package, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type CustomerAccountMenuProps = {
  authenticated: boolean;
  displayName: string;
  compact?: boolean;
};

export default function CustomerAccountMenu({ authenticated, displayName, compact = false }: CustomerAccountMenuProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoutLock = useRef(false);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    setPending(true);
    setErrorMessage(null);
    setOpen(false);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Customer logout failed", {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      setErrorMessage("Impossible de vous déconnecter. Veuillez réessayer.");
      setOpen(true);
      setPending(false);
      logoutLock.current = false;
      return;
    }

    setSignedOut(true);
    setPending(false);
    logoutLock.current = false;
    router.replace("/login");
    router.refresh();
  };

  if (!authenticated || signedOut) {
    return (
      <div className={`flex items-center ${compact ? "gap-2 text-xs" : "gap-8 lg:gap-12"}`}>
        <Link href="/login" className="whitespace-nowrap text-gray-800 transition hover:text-yellow-600">Se connecter</Link>
        <Link href="/register" className="whitespace-nowrap font-semibold text-[#9a7613] transition hover:text-yellow-600">Créer un compte</Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-8 lg:gap-12"}`}>
      <Link
        href="/orders"
        aria-label={compact ? "Mes commandes" : undefined}
        title={compact ? "Mes commandes" : undefined}
        className={`inline-flex items-center text-gray-800 transition hover:text-yellow-600 ${compact ? "rounded-full p-2.5" : "gap-2"}`}
      >
        <Package className="h-4 w-4" aria-hidden="true" />
        {!compact ? "Mes commandes" : null}
      </Link>

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`Compte connecté : ${displayName}`}
          className={`inline-flex max-w-[180px] items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-800 transition hover:border-[#D4AF37] hover:text-[#9a7613] ${compact ? "p-2.5" : "px-4 py-2"}`}
        >
          <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!compact ? <span className="truncate">{displayName}</span> : null}
          <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {open ? (
          <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 text-sm shadow-xl">
            <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 transition hover:bg-[#FFF8E8] hover:text-[#9a7613]">
              <UserRound className="h-4 w-4" aria-hidden="true" /> Mon compte
            </Link>
            <button role="menuitem" type="button" disabled={pending} onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
              <LogOut className="h-4 w-4" aria-hidden="true" /> {pending ? "Déconnexion..." : "Déconnexion"}
            </button>
            {errorMessage ? <p role="alert" className="px-3 py-2 text-xs text-red-600">{errorMessage}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
