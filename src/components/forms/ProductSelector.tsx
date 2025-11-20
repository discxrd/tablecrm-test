"use client";

import { useState } from "react";
import { Search, Plus, Minus, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useNomenclature, useSearchNomenclature } from "@/hooks/use-api";
import { useOrderStore } from "@/lib/stores/order-store";
import type { Nomenclature } from "@/lib/api/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ExtendedOrderGood = {
  sum: number;
  price: number;
  quantity: number;
  sum_discounted: number;
  productName: string;
};

export function ProductSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { goods, addGood, updateGood, removeGood } = useOrderStore();
  const debouncedSearch = useDebounce(search, 500);

  const { data: initialProducts = [], isLoading: isLoadingInitial } =
    useNomenclature({ limit: 20 });

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchNomenclature(debouncedSearch);

  const products =
    debouncedSearch.length >= 2 ? searchResults : initialProducts || [];
  const isLoading = debouncedSearch.length >= 2 ? isSearching : isLoadingInitial;

  const handleAddProduct = (product: Nomenclature) => {
    const newGood = {
      nomenclature: product.id,
      quantity: 1,
      unit: product.unit,
      price: product.price || 0,
      discount: 0,
      sum_discounted: 0,
    };
    addGood(newGood, product.name);
    setIsOpen(false);
    setSearch("");
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const good = goods[index];
    const newQuantity = Math.max(1, good.quantity + delta);
    updateGood(index, { quantity: newQuantity });
  };

  const handleUpdateDiscount = (index: number, discount: number) => {
    updateGood(index, { discount: Math.max(0, Math.min(100, discount)) });
  };

  const handleUpdateSum = (index: number, sum: number) => {
    updateGood(index, { sum: Math.max(0, sum) });
  };

  const calculateItemTotal = (good: ExtendedOrderGood) => {
    return good.sum || good.price * good.quantity - good.sum_discounted;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Товары</Label>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Выбор товара</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск товара..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading && (
                <p className="text-sm text-gray-500 text-center">Загрузка...</p>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleAddProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          {product.article && (
                            <p className="text-xs text-gray-500">
                              Артикул: {product.article}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {Number(product.price || 0).toFixed(2)} ₽
                          </p>
                          {product.stock_quantity !== undefined && (
                            <p className="text-xs text-gray-500">
                              На складе: {product.stock_quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!isLoading && products.length === 0 && search.length >= 2 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  Товары не найдены
                </p>
              )}

              {!isLoading && products.length === 0 && search.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  Нет доступных товаров
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goods.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-gray-500">
            <p className="text-sm">Добавьте товары в заказ</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {goods.map((good, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{good.productName}</p>
                      <p className="text-xs text-gray-500">
                        Цена: {good.price.toFixed(2)} ₽
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGood(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(index, -1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {good.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(index, 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <Label
                        htmlFor={`discount-${index}`}
                        className="text-xs whitespace-nowrap"
                      >
                        Скидка:
                      </Label>
                      <Input
                        id={`discount-${index}`}
                        type="number"
                        min="0"
                        max="100"
                        value={good.discount === 0 ? "" : good.discount}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numberValue = Number(value);
                          handleUpdateDiscount(index, isNaN(numberValue) ? 0 : numberValue);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="h-8 w-20 text-sm"
                      />
                      <span className="text-xs">%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`sum-${index}`}
                        className="text-xs whitespace-nowrap"
                      >
                        Сумма:
                      </Label>
                      <Input
                        id={`sum-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={good.sum === 0 ? "" : good.sum}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numberValue = Number(value);
                          handleUpdateSum(index, isNaN(numberValue) ? 0 : numberValue);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="h-8 w-24 text-sm"
                      />
                      <span className="text-xs">₽</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Итого:</span>
                    <div className="text-right">
                      {good.sum_discounted > 0 && (
                        <p className="text-xs text-red-500 line-through">
                          {(good.price * good.quantity).toFixed(2)} ₽
                        </p>
                      )}
                      <p className="font-semibold text-lg">
                        {calculateItemTotal(good).toFixed(2)} ₽
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
