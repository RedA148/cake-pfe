import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { OptionKind } from "@/lib/cake-options";
import { getAdminOptions } from "@/lib/admin-option-data";
import OptionManager from "@/app/admin/options/OptionManager";

const titles: Record<OptionKind, string> = {
  sizes: "Tailles",
  shapes: "Formes",
  flavors: "Saveurs",
  colors: "Couleurs",
};

export default async function OptionManagementPage({ kind }: { kind: OptionKind }) {
  const { options, error } = await getAdminOptions(kind);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <Link href="/admin/options" className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Retour aux options
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{titles[kind]}</h1>

        {error ? (
          <p className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</p>
        ) : (
          <OptionManager kind={kind} initialOptions={options} />
        )}
      </section>
    </main>
  );
}
