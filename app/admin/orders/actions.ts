"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import type { OrderStatus } from "@/lib/commerce";
import { NEXT_STATUS } from "@/lib/order-status";

const supportedStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

function normalizeOrderStatus(value: unknown): OrderStatus | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return supportedStatuses.includes(normalized as OrderStatus) ? normalized as OrderStatus : null;
}

function revalidateOrder(orderId: number) {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/orders/confirmation/${orderId}`);
}

function logTransitionError(
  orderId: number,
  currentStatus: OrderStatus | null,
  expectedNextStatus: OrderStatus | null,
  error: { message: string; code?: string; details?: string; hint?: string },
) {
  console.error("Order transition failed", {
    orderId,
    currentStatus,
    expectedNextStatus,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function advanceOrderStatus(orderId: number) {
  if (!Number.isInteger(orderId) || orderId <= 0) return { success: false, message: "Commande invalide.", status: null };
  const { supabase } = await requireAdminUser();
  const { data: order, error: readError } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
  if (readError) {
    logTransitionError(orderId, null, null, readError);
    return { success: false, message: "Impossible de vérifier le statut actuel.", status: null };
  }
  if (!order) return { success: false, message: "Commande introuvable.", status: null };

  const rawCurrentStatus = order.status;
  const currentStatus = normalizeOrderStatus(rawCurrentStatus);
  if (!currentStatus) return { success: false, message: "Le statut actuel de la commande est invalide.", status: null };
  const expectedNextStatus = NEXT_STATUS[currentStatus];
  if (!expectedNextStatus) return { success: false, message: "Cette commande ne peut plus avancer.", status: null };

  const { data, error } = await supabase
    .from("orders")
    .update({ status: expectedNextStatus })
    .eq("id", orderId)
    .eq("status", rawCurrentStatus)
    .select("id, status")
    .maybeSingle();

  if (process.env.NODE_ENV === "development") {
    console.info("Order transition result", {
      orderId,
      currentStatus,
      expectedNextStatus,
      updated: Boolean(data),
      returnedStatus: data?.status ?? null,
    });
  }

  if (error) {
    logTransitionError(orderId, currentStatus, expectedNextStatus, error);
    const message = error.code === "42501" || /row-level security|permission denied/i.test(error.message)
      ? "Supabase refuse la mise à jour. Appliquez la politique administrateur des commandes."
      : `Impossible de modifier le statut : ${error.message}`;
    return { success: false, message, status: null };
  }

  if (!data) {
    const { data: latestOrder, error: latestError } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
    if (latestError) {
      logTransitionError(orderId, currentStatus, expectedNextStatus, latestError);
      return { success: false, message: "Impossible de vérifier le nouveau statut.", status: null };
    }
    if (normalizeOrderStatus(latestOrder?.status) !== expectedNextStatus) {
      return { success: false, message: "Le statut a changé pendant la mise à jour. Réessayez.", status: null };
    }
  } else if (normalizeOrderStatus(data.status) !== expectedNextStatus) {
    return { success: false, message: "Supabase a retourné un statut inattendu.", status: null };
  }

  revalidateOrder(orderId);
  return { success: true, message: "", status: expectedNextStatus };
}

export async function cancelOrder(orderId: number) {
  if (!Number.isInteger(orderId) || orderId <= 0) return { success: false, message: "Commande invalide.", status: null };
  const { supabase } = await requireAdminUser();
  const { data: order, error: readError } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
  if (readError) {
    console.error("Order cancellation failed", { orderId, message: readError.message, code: readError.code, details: readError.details, hint: readError.hint });
    return { success: false, message: "Impossible de vérifier le statut actuel.", status: null };
  }
  if (!order) return { success: false, message: "Commande introuvable.", status: null };

  const rawCurrentStatus = order.status;
  const currentStatus = normalizeOrderStatus(rawCurrentStatus);
  if (!currentStatus) return { success: false, message: "Le statut actuel de la commande est invalide.", status: null };
  if (!NEXT_STATUS[currentStatus]) return { success: false, message: "Cette commande ne peut pas être annulée.", status: null };

  const { data, error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("status", rawCurrentStatus).select("id, status").maybeSingle();
  if (error) {
    console.error("Order cancellation failed", { orderId, currentStatus, message: error.message, code: error.code, details: error.details, hint: error.hint });
    return { success: false, message: "Impossible d’annuler la commande.", status: null };
  }
  if (!data) {
    const { data: latestOrder, error: latestError } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
    if (latestError) {
      console.error("Order cancellation failed", { orderId, currentStatus, message: latestError.message, code: latestError.code, details: latestError.details, hint: latestError.hint });
      return { success: false, message: "Impossible de vérifier le nouveau statut.", status: null };
    }
    if (normalizeOrderStatus(latestOrder?.status) !== "cancelled") return { success: false, message: "Le statut a changé pendant l’annulation. Réessayez.", status: null };
  }

  revalidateOrder(orderId);
  return { success: true, message: "", status: "cancelled" as const };
}
