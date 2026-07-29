import type { OrderStatus } from "@/lib/commerce";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const ORDER_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered"];

export const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
  cancelled: null,
} as const satisfies Record<OrderStatus, OrderStatus | null>;
