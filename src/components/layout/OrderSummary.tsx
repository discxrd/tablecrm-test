"use client";

import { useOrderStore } from "@/lib/stores/order-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderSummaryProps {
  onContinue: () => void;
}

export function OrderSummary({ onContinue }: OrderSummaryProps) {
  const { goods, getTotalDiscount, getFinalSum, isOrderComplete } =
    useOrderStore();

  const totalDiscount = getTotalDiscount();
  const finalSum = getFinalSum();

  const canContinue = isOrderComplete();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="container max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-gray-600">Товаров: </span>
              <Badge variant="secondary">{goods.length}</Badge>
            </div>
            <div>
              <span className="text-sm text-gray-600">Итого: </span>
              <span className="font-bold text-xl text-blue-600">
                {finalSum.toFixed(2)} ₽
              </span>
            </div>
            {totalDiscount > 0 && (
              <div>
                <span className="text-xs text-red-500">
                  (скидка {totalDiscount.toFixed(2)} ₽)
                </span>
              </div>
            )}
          </div>
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={onContinue}
            className="min-w-[120px]"
          >
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}
