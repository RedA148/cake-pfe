import Link from "next/link";
import { Circle, Heart, Palette, Ruler } from "lucide-react";
import { requireAdminUser } from "@/lib/admin-auth";

const cards = [
  { href: "/admin/options/sizes", label: "Tailles", description: "Gérer les tailles et leurs suppléments.", icon: Ruler },
  { href: "/admin/options/shapes", label: "Formes", description: "Gérer les formes proposées.", icon: Heart },
  { href: "/admin/options/flavors", label: "Saveurs", description: "Gérer les saveurs disponibles.", icon: Circle },
  { href: "/admin/options/colors", label: "Couleurs", description: "Gérer les couleurs de personnalisation.", icon: Palette },
];

export default async function AdminOptionsPage() {
  await requireAdminUser();
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Options des gâteaux</h1>
        <p className="mt-3 text-lg text-gray-600">Configurez les choix proposés pendant la personnalisation.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_15px_45px_-25px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-[#D4AF37]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF8E8] text-[#D4AF37]"><Icon className="h-6 w-6" /></div>
                <h2 className="mt-5 text-xl font-semibold">{card.label}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
