import CheckoutForm from "@/app/(client)/checkout/CheckoutForm";
import { createClient } from "@/lib/server";
import { getCartItems } from "@/lib/cart-data";
import type { Address } from "@/lib/commerce";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900"><section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Confirmation</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Finaliser votre commande</h1></div><CheckoutForm initialAddresses={[]} items={[]} customer={null} authenticated={false} /></section></main>;
  }
  const [items, addressesResult, profileResult] = await Promise.all([
    getCartItems(supabase, user.id),
    supabase.from("addresses").select("id, profile_id, full_name, phone, address, city, postal_code, created_at").eq("profile_id", user.id).order("created_at"),
    supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
  ]);
  if (addressesResult.error) console.error("Unable to load checkout addresses", { message: addressesResult.error.message, code: addressesResult.error.code, details: addressesResult.error.details, hint: addressesResult.error.hint });

  return <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900"><section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Confirmation</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Finaliser votre commande</h1></div><CheckoutForm initialAddresses={(addressesResult.data ?? []) as Address[]} items={items} customer={{ name: profileResult.data?.full_name ?? "Client", email: profileResult.data?.email ?? user.email ?? "" }} authenticated /></section></main>;
}
