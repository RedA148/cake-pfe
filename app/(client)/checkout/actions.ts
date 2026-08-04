"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/user-auth";
import { createClient } from "@/lib/server";
import type { Address, GuestCartItem, PaymentMethod } from "@/lib/commerce";

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

export type GuestCheckoutDetails = { fullName: string; email: string; phone: string; address: string };

export async function confirmGuestOrder(items: GuestCartItem[], details: GuestCheckoutDetails, paymentMethod: PaymentMethod) {
  const guest = { fullName: details.fullName.trim(), email: details.email.trim().toLowerCase(), phone: details.phone.trim(), address: details.address.trim() };
  if (!guest.fullName || !guest.phone || !guest.address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) return { success: false, message: "Renseignez des informations de livraison valides." };
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return { success: false, message: "Votre panier est vide ou invalide." };
  if (!["cash_on_delivery", "card"].includes(paymentMethod)) return { success: false, message: "Mode de paiement invalide." };
  const payload = items.map((item) => ({ product_id: item.productId, quantity: item.quantity, size_id: item.size_id, shape_id: item.shape_id, flavor_id: item.flavor_id, color_id: item.color_id, custom_text: item.customText, instructions: item.instructions, image_url: item.uploadedImage }));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_guest_order", { p_items: payload, p_full_name: guest.fullName, p_email: guest.email, p_phone: guest.phone, p_address: guest.address, p_payment_method: paymentMethod });
  if (error) {
    logError("Unable to create guest order", error);
    const message = error.message.includes("PRODUCT_UNAVAILABLE") ? "Un produit de votre panier n’est plus disponible." : error.message.includes("INVALID_CART") ? "Votre panier est vide ou invalide." : "Impossible de créer la commande. Aucun paiement n’a été effectué.";
    return { success: false, message };
  }
  return { success: true, message: "Commande créée.", orderId: Number(data) };
}
