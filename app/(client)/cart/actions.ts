"use server";

import { createClient } from "@/lib/server";
import { buildCartResult, calculateCartTotals, getCartItems, getOrCreateCart, validateGuestItem } from "@/lib/cart-data";
import type { CartResult, GuestCartItem } from "@/lib/commerce";
import { ensureCurrentUserProfile } from "@/lib/user-auth";

function sameConfiguration(a: GuestCartItem, b: GuestCartItem) {
  return a.productId === b.productId && a.shape_id === b.shape_id && a.size_id === b.size_id &&
    a.flavor_id === b.flavor_id && a.color_id === b.color_id && a.customText === b.customText &&
    a.instructions === b.instructions && a.uploadedImage === b.uploadedImage;
}

function mergeGuestItems(items: GuestCartItem[]): GuestCartItem[] {
  const merged: GuestCartItem[] = [];
  for (const item of items) {
    const duplicate = merged.find((candidate) => sameConfiguration(candidate, item));
    if (duplicate) {
      duplicate.quantity += item.quantity;
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

function logError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error(operation, { message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function loadCart(guestItems: GuestCartItem[]): Promise<CartResult> {
  const supabase = await createClient();
  let authenticated = false;

  try {
    const user = await ensureCurrentUserProfile(supabase);
    authenticated = Boolean(user);
    if (!user) {
      const validated = (await Promise.all(guestItems.map((item) => validateGuestItem(supabase, item))))
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      return { authenticated: false, items: validated, total: calculateCartTotals(validated), error: null };
    }

    const cart = await getOrCreateCart(supabase, user.id);
    const existing = await getCartItems(supabase, user.id);

    for (const guestItem of mergeGuestItems(guestItems)) {
      const validated = await validateGuestItem(supabase, guestItem);
      if (!validated || !validated.isAvailable) continue;
      const duplicate = existing.find((item) => sameConfiguration(item, validated));
      if (duplicate?.id) {
        const { error } = await supabase.from("cart_items").update({ quantity: duplicate.quantity + validated.quantity }).eq("id", duplicate.id);
        if (error) throw error;
        duplicate.quantity += validated.quantity;
        continue;
      }

      const { data: cartItem, error: itemError } = await supabase.from("cart_items")
        .insert({ cart_id: cart.id, product_id: validated.productId, quantity: validated.quantity })
        .select("id").single();
      if (itemError) throw itemError;
      const { error: customizationError } = await supabase.from("cake_customizations").insert({
        cart_item_id: cartItem.id, size_id: validated.size_id, shape_id: validated.shape_id,
        flavor_id: validated.flavor_id, color_id: validated.color_id,
        custom_text: validated.customText || null, instructions: validated.instructions || null,
        image_url: validated.uploadedImage,
      });
      if (customizationError) {
        await supabase.from("cart_items").delete().eq("id", cartItem.id);
        throw customizationError;
      }
      existing.push({ ...validated, id: cartItem.id, cart_id: cart.id });
    }

    return await buildCartResult(supabase, user.id);
  } catch (error) {
    if (error && typeof error === "object" && "message" in error) logError("Unable to load or synchronize cart", error as { message: string });
    if (!authenticated) {
      const localItems = guestItems.filter((item) =>
        Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0 &&
        typeof item.productName === "string" && typeof item.productImage === "string" &&
        typeof item.shape === "string" && typeof item.size === "string" &&
        typeof item.flavor === "string" && typeof item.color === "string" &&
        typeof (item as Partial<CartResult["items"][number]>).unitPrice === "number" &&
        typeof (item as Partial<CartResult["items"][number]>).totalPrice === "number"
      ) as CartResult["items"];
      return { authenticated: false, items: localItems, total: calculateCartTotals(localItems), error: null };
    }
    return { authenticated, items: [], total: 0, error: "Impossible de charger le panier." };
  }
}

async function requireOwnedCartItem(itemId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("cart_items").select("id, cart!inner(profile_id)").eq("id", itemId).eq("cart.profile_id", user.id).maybeSingle();
  if (error) { logError("Unable to verify cart item ownership", error); return null; }
  return data ? { supabase, user } : null;
}

export async function updateCartItemQuantity(itemId: number, quantity: number) {
  if (!Number.isInteger(itemId) || itemId <= 0 || !Number.isInteger(quantity) || quantity <= 0) return { success: false, message: "Quantité invalide." };
  const context = await requireOwnedCartItem(itemId);
  if (!context) return { success: false, message: "Article introuvable ou accès refusé." };
  const { error } = await context.supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  if (error) { logError("Unable to update cart quantity", error); return { success: false, message: "Impossible de modifier la quantité." }; }
  return { success: true, message: "Quantité mise à jour." };
}

type CartCustomizationUpdate = Pick<GuestCartItem,
  "size_id" | "shape_id" | "flavor_id" | "color_id" | "customText" | "instructions" | "uploadedImage"
>;

export async function updateCartItemCustomization(itemId: number, customization: CartCustomizationUpdate) {
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { success: false, message: "Article invalide." };
  }

  const context = await requireOwnedCartItem(itemId);
  if (!context) return { success: false, message: "Article introuvable ou accès refusé." };

  const optionIds = [
    customization.size_id,
    customization.shape_id,
    customization.flavor_id,
    customization.color_id,
  ];
  if (optionIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { success: false, message: "Options de personnalisation invalides." };
  }

  const { error } = await context.supabase
    .from("cake_customizations")
    .update({
      size_id: customization.size_id,
      shape_id: customization.shape_id,
      flavor_id: customization.flavor_id,
      color_id: customization.color_id,
      custom_text: customization.customText.trim() || null,
      instructions: customization.instructions.trim() || null,
      image_url: customization.uploadedImage,
    })
    .eq("cart_item_id", itemId);

  if (error) {
    logError("Unable to update cart customization", error);
    return { success: false, message: "Impossible de modifier l’article." };
  }

  return { success: true, message: "Article modifié." };
}

export async function removeCartItem(itemId: number) {
  const context = await requireOwnedCartItem(itemId);
  if (!context) return { success: false, message: "Article introuvable ou accès refusé." };
  const { error } = await context.supabase.from("cart_items").delete().eq("id", itemId);
  if (error) { logError("Unable to remove cart item", error); return { success: false, message: "Impossible de supprimer l’article." }; }
  return { success: true, message: "Article supprimé." };
}

export async function clearCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Connexion requise." };
  const { data: cart } = await supabase.from("cart").select("id").eq("profile_id", user.id).maybeSingle();
  if (!cart) return { success: true, message: "Panier déjà vide." };
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (error) { logError("Unable to clear cart", error); return { success: false, message: "Impossible de vider le panier." }; }
  return { success: true, message: "Panier vidé." };
}
