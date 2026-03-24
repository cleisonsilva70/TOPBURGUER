"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export function CartPanel() {
  const { items, increaseItem, decreaseItem, removeItem } = useCartStore();

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <aside className="panel-card order-first p-5 xl:order-none xl:sticky xl:top-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
            Carrinho
          </p>
          <h3 className="mt-2 text-2xl font-black">Seu pedido</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(35,21,15,0.96),rgba(57,31,21,0.92))] text-white shadow-[0_18px_36px_rgba(35,21,15,0.18)]">
          <ShoppingBag size={20} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="panel-subtle mt-6 border-dashed p-5 text-sm leading-6 text-[var(--muted)]">
          Adicione burgers, combos e bebidas para montar o pedido.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="panel-subtle p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatCurrency(item.price)} cada
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-[var(--danger)] transition-opacity hover:opacity-75"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="glass-pill inline-flex items-center gap-2 rounded-full px-2 py-2">
                  <button
                    type="button"
                    onClick={() => decreaseItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--foreground)]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-6 text-center font-bold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => increaseItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <strong className="text-lg text-[var(--brand)]">
                  {formatCurrency(item.subtotal)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-[24px] bg-[linear-gradient(180deg,rgba(35,21,15,0.98),rgba(57,31,21,0.92))] p-5 text-white shadow-[0_22px_50px_rgba(35,21,15,0.22)]">
        <div className="flex items-center justify-between text-sm text-white/75">
          <span>Itens</span>
          <span>{itemCount}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-2xl font-black">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <Link
          href="/checkout"
          className={`mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full px-4 py-3 text-center text-sm font-bold transition-colors ${
            items.length === 0
              ? "pointer-events-none bg-white/15 text-white/55"
              : "bg-[var(--accent)] text-[var(--foreground)] hover:bg-[#ffd372]"
          }`}
        >
          Avancar para entrega
        </Link>
      </div>
    </aside>
  );
}
