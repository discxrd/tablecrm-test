"use client";

import { useState } from "react";
import { useOrderStore } from "@/lib/stores/order-store";
import { useCreateOrder } from "@/hooks/use-api";
import type { CreateOrderPayload } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, X } from "lucide-react";

interface OrderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export function OrderBottomSheet({
  isOpen,
  onClose,
  onOrderCreated,
}: OrderBottomSheetProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { mutate: createOrder, isPending } = useCreateOrder();

  const {
    contragent,
    warehouse,
    paybox,
    organization,
    priceType,
    goods,
    getTotalSum,
    getTotalDiscount,
    getFinalSum,
    resetOrder,
  } = useOrderStore();

  const totalSum = getTotalSum();
  const totalDiscount = getTotalDiscount();
  const finalSum = getFinalSum();

  const canCreateOrder = () => {
    return (
      contragent && warehouse && paybox && organization && goods.length > 0
    );
  };

  const createOrderPayload = (isPosted: boolean): CreateOrderPayload => {
    return {
      priority: 0,
      dated: Math.floor(Date.now() / 1000),
      operation: "Заказ",
      tax_included: true,
      tax_active: true,
      goods: goods.map((good) => ({
        nomenclature: good.nomenclature,
        quantity: good.quantity,
        unit: good.unit,
        price: good.price,
        discount: good.discount,
        sum_discounted: good.sum_discounted,
      })),
      settings: {},
      warehouse: warehouse!.id,
      contragent: contragent!.id,
      paybox: paybox!.id,
      organization: organization!.id,
      ...(priceType && { price_type: priceType.id }),
      ...(contragent?.loyality_card_id && {
        loyality_card_id: contragent.loyality_card_id,
      }),
      status: isPosted,
      paid_rubles: finalSum,
      paid_lt: 0,
    };
  };

  const handleCreateOrder = (post: boolean = false) => {
    if (!canCreateOrder()) return;

    setIsPosting(post);
    setSuccess(false);

    const payload = createOrderPayload(post);

    createOrder(
      { data: payload, post },
      {
        onSuccess: () => {
          setSuccess(true);
          // Reset form after 2 seconds
          setTimeout(() => {
            resetOrder();
            setSuccess(false);
            onClose();
            onOrderCreated?.();
          }, 2000);
        },
        onError: (error) => {
          console.error("Order creation error:", error);
          alert(
            "Ошибка при создании заказа. Проверьте данные и попробуйте снова."
          );
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending && !success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Детали заказа</DialogTitle>
          </div>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Заказ успешно создан!
            </h3>
            <p className="text-sm text-green-600">
              Форма будет очищена через мгновение...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Клиент
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{contragent?.name}</p>
                  <p className="text-sm text-gray-600">{contragent?.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Товары
                </h4>
                <div className="space-y-2">
                  {goods.map((good, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {good.productName || `Товар #${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-600">
                            {good.quantity} шт. × {good.price.toFixed(2)} ₽
                          </p>
                          {good.discount > 0 && (
                            <p className="text-xs text-red-500">
                              Скидка: {good.discount}%
                            </p>
                          )}
                        </div>
                        <p className="font-medium">{good.sum.toFixed(2)} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товаров:</span>
                  <Badge variant="secondary">{goods.length}</Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Сумма:</span>
                  <span className="font-medium">{totalSum.toFixed(2)} ₽</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Скидка:</span>
                    <span className="font-medium text-red-500">
                      -{totalDiscount.toFixed(2)} ₽
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold text-lg">Итого:</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {finalSum.toFixed(2)} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={!canCreateOrder() || isPending}
                onClick={() => handleCreateOrder(false)}
                className="w-full"
              >
                {isPending && !isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать"
                )}
              </Button>

              <Button
                size="lg"
                disabled={!canCreateOrder() || isPending}
                onClick={() => handleCreateOrder(true)}
                className="w-full"
              >
                {isPending && isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Создать и провести"
                )}
              </Button>
            </div>

            {!canCreateOrder() && (
              <p className="text-xs text-center text-red-500">
                Заполните все обязательные поля и добавьте товары
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
