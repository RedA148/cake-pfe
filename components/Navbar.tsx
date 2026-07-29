import Link from "next/link";
import { createClient } from "@/lib/server";
import CustomerAccountMenu from "@/components/CustomerAccountMenu";

const publicLinks = [
  // { label: "Accueil", href: "/catalogue" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Panier", href: "/cart" },
];

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let displayName = user?.email ?? "Mon compte";

  if (user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Unable to load navbar profile", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    displayName = profile?.full_name?.trim() || profile?.email || user.email || "Mon compte";
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/catalogue" className="flex items-center gap-3">
          <span className="text-xl font-bold text-yellow-600 sm:text-2xl">
            Délices de Bakri
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-medium md:flex lg:gap-12">
          {publicLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-800 transition hover:text-yellow-600"
            >
              {link.label}
            </Link>
          ))}
          <CustomerAccountMenu authenticated={Boolean(user)} displayName={displayName} />
        </nav>
        <div className="md:hidden">
          <CustomerAccountMenu authenticated={Boolean(user)} displayName={displayName} compact />
        </div>
      </div>
    </header>
  );
}
