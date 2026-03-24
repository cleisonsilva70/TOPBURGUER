"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  addCustomizedItem: (item: CartItem) => void;
  increaseItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

function mapSubtotal(item: Omit<CartItem, "subtotal">) {
  return {
    ...item,
    subtotal: item.price * item.quantity,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const cartItemId = `${product.id}-default`;
          const existing = state.items.find((item) => item.cartItemId === cartItemId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.cartItemId === cartItemId
                  ? mapSubtotal({ ...item, quantity: item.quantity + 1 })
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              mapSubtotal({
                ...product,
                cartItemId,
                quantity: 1,
              }),
            ],
          };
        }),
      addCustomizedItem: (cartItem) =>
        set((state) => {
          const existing = state.items.find((item) => item.cartItemId === cartItem.cartItemId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.cartItemId === cartItem.cartItemId
                  ? mapSubtotal({ ...item, quantity: item.quantity + cartItem.quantity })
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, mapSubtotal(cartItem)],
          };
        }),
      increaseItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === id
              ? mapSubtotal({ ...item, quantity: item.quantity + 1 })
              : item,
          ),
        })),
      decreaseItem: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.cartItemId === id
                ? mapSubtotal({ ...item, quantity: item.quantity - 1 })
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== id),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "fastfood-cart",
    },
  ),
);
