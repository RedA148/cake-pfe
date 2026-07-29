import { Check, X } from "lucide-react";
import type { OrderStatus } from "@/lib/commerce";
import { ORDER_FLOW, ORDER_STATUS_LABELS } from "@/lib/order-status";

export default function OrderStatusProgress({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  const cancelled = status === "cancelled";
  const currentIndex = cancelled ? -1 : ORDER_FLOW.indexOf(status);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {cancelled ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700" role="status">
          <X className="h-4 w-4" aria-hidden="true" /> Commande annulée
        </div>
      ) : null}
      <div className="max-w-full overflow-x-auto overscroll-x-contain pb-2">
        <ol className={`flex min-w-[620px] items-start ${compact ? "gap-0" : "gap-1"}`} aria-label="Progression de la commande">
          {ORDER_FLOW.map((step, index) => {
            const completed = !cancelled && index < currentIndex;
            const current = !cancelled && index === currentIndex;
            return (
              <li key={step} className="flex min-w-0 flex-1 items-start" aria-current={current ? "step" : undefined}>
                <div className="flex min-w-[88px] flex-col items-center text-center">
                  <span className={`flex items-center justify-center rounded-full border text-xs font-bold transition ${compact ? "h-7 w-7" : "h-9 w-9"} ${current ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-[0_4px_14px_rgba(212,175,55,0.45)] ring-4 ring-[#D4AF37]/20" : completed ? "border-[#D4AF37] bg-[#D4AF37] text-white" : "border-gray-300 bg-gray-100 text-gray-500"}`}>
                    {completed ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={`mt-2 whitespace-nowrap text-xs ${current ? "font-bold text-gray-950" : completed ? "font-semibold text-gray-900" : "font-semibold text-gray-500"}`}>{ORDER_STATUS_LABELS[step]}</span>
                  <span className="sr-only">{current ? "Étape actuelle" : completed ? "Étape terminée" : "Étape à venir"}</span>
                </div>
                {index < ORDER_FLOW.length - 1 ? <span className={`${compact ? "mt-3.5" : "mt-4"} h-1 min-w-5 flex-1 rounded-full ${!cancelled && index < currentIndex ? "bg-[#D4AF37]" : "bg-gray-200"}`} aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
