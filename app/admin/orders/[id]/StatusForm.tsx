"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { advanceOrderStatus, cancelOrder } from "@/app/admin/orders/actions";
import OrderStatusProgress from "@/components/OrderStatusProgress";
import type { OrderStatus } from "@/lib/commerce";
import { NEXT_STATUS, ORDER_STATUS_LABELS } from "@/lib/order-status";

const nextButtonLabels: Record<Exclude<OrderStatus, "delivered" | "cancelled">, string> = {
  pending: "Confirmer la commande",
  confirmed: "Passer en préparation",
  preparing: "Marquer comme prête",
  ready: "Marquer comme livrée",
};

type OrderStatusActionResult = {
  success: boolean;
  message: string;
  status: OrderStatus | null;
};

export default function StatusForm({ orderId, initialStatus }: { orderId: number; initialStatus: OrderStatus }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const actionInProgressRef = useRef(false);
  const nextStatus = NEXT_STATUS[currentStatus];

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setCurrentStatus(initialStatus);
    });
    return () => {
      active = false;
    };
  }, [initialStatus]);

  function runAction(action: () => Promise<OrderStatusActionResult>) {
    if (pending || actionInProgressRef.current) return;
    actionInProgressRef.current = true;
    setMessage("");
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.success || !result.status) {
          setMessage(result.message);
          return;
        }
        setMessage("");
        setCurrentStatus(result.status);
        router.refresh();
      } finally {
        actionInProgressRef.current = false;
      }
    });
  }

  function handleCancel() {
    if (!window.confirm("Confirmer l’annulation de cette commande ?")) return;
    runAction(() => cancelOrder(orderId));
  }

  return (
    <>
      <OrderStatusProgress status={currentStatus} />
      <div className="mx-auto mt-5 max-w-md border-t border-gray-200 pt-5">
        <p className="text-sm text-gray-600">Statut actuel</p>
        <p className="mt-1 font-semibold text-gray-900">{ORDER_STATUS_LABELS[currentStatus]}</p>
        {nextStatus ? (
          <>
            <button type="button" disabled={pending} onClick={() => runAction(() => advanceOrderStatus(orderId))} className="mt-4 w-full rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c79c1f] disabled:opacity-50">
              {pending ? "Mise à jour..." : nextButtonLabels[currentStatus as keyof typeof nextButtonLabels]}
            </button>
            <button type="button" disabled={pending} onClick={handleCancel} className="mt-3 w-full rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">
              Annuler la commande
            </button>
          </>
        ) : (
          <p className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${currentStatus === "cancelled" ? "bg-red-50 text-red-700" : "bg-[#FFF8E8] text-[#D4AF37]"}`}>
            {currentStatus === "cancelled" ? "Commande annulée" : "Commande livrée"}
          </p>
        )}
        {message ? <p className="mt-3 text-sm" role="status">{message}</p> : null}
      </div>
    </>
  );
}
