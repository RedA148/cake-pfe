import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, MapPin, Package } from "lucide-react";
import ProfileForm from "@/app/(client)/account/ProfileForm";
import { signOutAccount } from "@/app/(client)/account/actions";
import { requireUser } from "@/lib/user-auth";
import type { Address } from "@/lib/commerce";

type AccountProfile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

function initials(name: string, email: string) {
  const source = name.trim() || email;
  return source.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

export default async function AccountPage() {
  const { supabase, user } = await requireUser("/account");
  const [profileResult, addressesResult] = await Promise.all([
    supabase.from("profiles").select("full_name,email,phone,role,created_at").eq("id", user.id).maybeSingle(),
    supabase.from("addresses").select("id,profile_id,full_name,phone,address,city,postal_code,created_at").eq("profile_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) {
    console.error("Unable to load account profile", { message: profileResult.error.message, code: profileResult.error.code, details: profileResult.error.details, hint: profileResult.error.hint });
    throw new Error("Impossible de charger le profil.");
  }
  if (addressesResult.error) {
    console.error("Unable to load account addresses", { message: addressesResult.error.message, code: addressesResult.error.code, details: addressesResult.error.details, hint: addressesResult.error.hint });
    throw new Error("Impossible de charger les adresses.");
  }

  const profile = profileResult.data as AccountProfile | null;
  if (!profile) throw new Error("Profil introuvable.");
  if (profile.role === "admin") redirect("/admin");

  const fullName = profile.full_name?.trim() ?? "";
  const email = profile.email ?? user.email ?? "";
  const phone = profile.phone?.trim() ?? "";
  const addresses = (addressesResult.data ?? []) as Address[];

  return (
    <>
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
          <header className="flex flex-col gap-6 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#FFF8E8] text-2xl font-bold text-[#9a7613] ring-4 ring-[#D4AF37]/15">
              {initials(fullName, email)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Espace client</p>
              <h1 className="mt-2 text-4xl font-bold">Mon compte</h1>
              <p className="mt-2 text-gray-600">Gérez vos informations personnelles</p>
              <p className="mt-4 font-semibold">{fullName || "Client"}</p>
              <p className="break-all text-sm text-gray-500">{email}</p>
            </div>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
            <ProfileForm fullName={fullName} email={email} phone={phone} createdAt={dateFormatter.format(new Date(profile.created_at))} />

            <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Liens utiles</h2>
              <div className="mt-5 space-y-2">
                <Link href="/orders" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-gray-700 transition hover:bg-[#FFF8E8] hover:text-[#9a7613]"><Package className="h-5 w-5" /> Mes commandes</Link>
                <a href="#addresses" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-gray-700 transition hover:bg-[#FFF8E8] hover:text-[#9a7613]"><MapPin className="h-5 w-5" /> Mes adresses</a>
                <form action={signOutAccount}>
                  <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"><LogOut className="h-5 w-5" /> Se déconnecter</button>
                </form>
              </div>
            </aside>
          </div>

          <section id="addresses" className="mt-8 rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">Mes adresses</h2>
            {addresses.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#FAFAFA] p-8 text-center text-gray-500">Aucune adresse enregistrée.</div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <article key={address.id} className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5 text-sm leading-6">
                    <p className="font-semibold text-gray-900">{address.full_name}</p>
                    <p>{address.phone}</p>
                    <p className="mt-3">{address.address}</p>
                    <p>{address.postal_code} {address.city}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
