"use client";

import Link from "next/link";

const links = [
  // { label: "Accueil", href: "/catalogue" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Panier", href: "/cart" },
  { label: "Connexion", href: "/login" },
];

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/catalogue" className="flex items-center gap-3">
          <span className="text-xl font-bold text-yellow-600 sm:text-2xl">
            Délices de Bakri
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-medium md:flex lg:gap-12">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-800 transition hover:text-yellow-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}