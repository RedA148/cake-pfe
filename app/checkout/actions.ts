"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user-auth";
import type { Address, PaymentMethod } from "@/lib/commerce";

function logError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error(operation, { message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function createAddress(input: Omit<Address, "id" | "profile_id" | "created_at">) {
  const values = {
    full_name: input.full_name.trim(), phone: input.phone.trim(), address: input.address.trim(),
    city: input.city.trim(), postal_code: input.postal_code.trim(),
  };
  if (Object.values(values).some((value) => !value)) return { success: false, message: "Tous les champs de l’adresse sont obligatoires.", address: null };
  const { supabase, user } = await requireUser("/checkout");
  const { data, error } = await supabase.from("addresses").insert({ ...values, profile_id: user.id }).select("id, profile_id, full_name, phone, address, city, postal_code, created_at").single();
  if (error) { logError("Unable to create address", error); return { success: false, message: "Impossible d’ajouter l’adresse.", address: null }; }
  return { success: true, message: "Adresse ajoutée.", address: data as Address };
}

export async function confirmOrder(addressId: number, paymentMethod: PaymentMethod) {
  if (!Number.isInteger(addressId) || addressId <= 0) return { success: false, message: "Sélectionnez une adresse valide." };
  if (!["cash_on_delivery", "card"].includes(paymentMethod)) return { success: false, message: "Mode de paiement invalide." };
  const { supabase } = await requireUser("/checkout");
  const { data, error } = await supabase.rpc("create_order_from_cart", { p_address_id: addressId, p_payment_method: paymentMethod });
  if (error) {
    logError("Unable to create order", error);
    const message = error.message.includes("EMPTY_CART") ? "Votre panier est vide."
      : error.message.includes("PRODUCT_UNAVAILABLE") ? "Un produit de votre panier n’est plus disponible."
        : "Impossible de créer la commande. Aucun paiement n’a été effectué.";
    return { success: false, message };
  }
  const orderId = Number(data);
  revalidatePath("/cart"); revalidatePath("/orders"); revalidatePath("/admin/orders");
  redirect(`/orders/confirmation/${orderId}`);
}
