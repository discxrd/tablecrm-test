import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Contragent,
  Warehouse,
  Paybox,
  Organization,
  PriceType,
  OrderGood,
} from "../api/types";

interface ExtendedOrderGood extends OrderGood {
  productName: string;
  sum: number; // Manual sum input by user
}

interface OrderState {
  // Authentication
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;

  // Order data
  contragent: Contragent | null;
  warehouse: Warehouse | null;
  paybox: Paybox | null;
  organization: Organization | null;
  priceType: PriceType | null;
  goods: ExtendedOrderGood[];
  comment: string;

  // Setters
  setContragent: (contragent: Contragent | null) => void;
  setWarehouse: (warehouse: Warehouse | null) => void;
  setPaybox: (paybox: Paybox | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setPriceType: (priceType: PriceType | null) => void;
  setComment: (comment: string) => void;

  // Goods management
  addGood: (good: OrderGood, productName: string) => void;
  updateGood: (index: number, goodUpdate: Partial<ExtendedOrderGood>) => void;
  removeGood: (index: number) => void;
  clearGoods: () => void;

  // Validation
  isOrderComplete: () => boolean;

  // Calculations
  getTotalSum: () => number;
  getTotalDiscount: () => number;
  getFinalSum: () => number;

  // Reset
  resetOrder: () => void;
}

const initialState = {
  token: null,
  isAuthenticated: false,
  contragent: null,
  warehouse: null,
  paybox: null,
  organization: null,
  priceType: null,
  goods: [],
  comment: "",
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setToken: (token) => {
        set({ token, isAuthenticated: true });
      },

      clearToken: () => {
        set({ token: null, isAuthenticated: false });
      },

      setContragent: (contragent) => set({ contragent }),
      setWarehouse: (warehouse) => set({ warehouse }),
      setPaybox: (paybox) => set({ paybox }),
      setOrganization: (organization) => set({ organization }),
      setPriceType: (priceType) => set({ priceType }),
      setComment: (comment) => set({ comment }),

      addGood: (good, productName) => {
        const extendedGood: ExtendedOrderGood = {
          ...good,
          productName,
          sum: good.price * good.quantity - good.sum_discounted,
        };
        set((state) => ({ goods: [...state.goods, extendedGood] }));
      },

      updateGood: (index, goodUpdate) => {
        set((state) => {
          const goods = [...state.goods];
          goods[index] = { ...goods[index], ...goodUpdate };
          // Recalculate sum if quantity, price, or discount changed
          if (
            goodUpdate.quantity !== undefined ||
            goodUpdate.price !== undefined ||
            goodUpdate.discount !== undefined
          ) {
            const updatedGood = goods[index];
            const subtotal = updatedGood.price * updatedGood.quantity;
            updatedGood.sum_discounted =
              (subtotal * updatedGood.discount) / 100;
            updatedGood.sum = subtotal - updatedGood.sum_discounted;
          } else if (goodUpdate.sum !== undefined) {
            const updatedGood = goods[index];
            const discountFactor = 1 - (updatedGood.discount || 0) / 100;

            if (updatedGood.quantity > 0 && discountFactor > 0) {
              updatedGood.price =
                updatedGood.sum / (updatedGood.quantity * discountFactor);
              updatedGood.sum_discounted =
                updatedGood.price * updatedGood.quantity - updatedGood.sum;
            }
          }
          return { goods };
        });
      },

      removeGood: (index) => {
        set((state) => ({
          goods: state.goods.filter((_, i) => i !== index),
        }));
      },

      clearGoods: () => set({ goods: [] }),

      isOrderComplete: () => {
        const {
          contragent,
          warehouse,
          paybox,
          organization,
          priceType,
          goods,
        } = get();

        // Check if all required fields are filled
        const hasBasicFields = Boolean(
          contragent && warehouse && paybox && organization && priceType
        );

        // Check if there are goods and all have valid sums
        const hasValidGoods =
          goods.length > 0 &&
          goods.every(
            (good) => good.sum > 0 && good.quantity > 0 && good.price >= 0
          );

        return Boolean(hasBasicFields && hasValidGoods);
      },

      getTotalSum: () => {
        const { goods } = get();
        return goods.reduce((sum, good) => sum + good.price * good.quantity, 0);
      },

      getTotalDiscount: () => {
        const { goods } = get();
        return goods.reduce((sum, good) => sum + good.sum_discounted, 0);
      },

      getFinalSum: () => {
        const { goods } = get();
        return goods.reduce((sum, good) => sum + good.sum, 0);
      },

      resetOrder: () => {
        set({
          contragent: null,
          warehouse: null,
          paybox: null,
          organization: null,
          priceType: null,
          goods: [],
          comment: "",
        });
      },
    }),
    {
      name: "tablecrm-order-storage",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
