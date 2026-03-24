"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CartItem, Product } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

type ProductCustomizerModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductCustomizerModal({
  product,
  isOpen,
  onClose,
}: ProductCustomizerModalProps) {
  const addCustomizedItem = useCartStore((state) => state.addCustomizedItem);
  const [selectedSizeId, setSelectedSizeId] = useState(product?.sizeOptions?.[0]?.id ?? "");
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<string[]>([]);
  const [customerNote, setCustomerNote] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const selectedSize = product?.sizeOptions?.find((option) => option.id === selectedSizeId);
  const selectedOptionalItems = useMemo(
    () =>
      (product?.optionalItems ?? []).filter((option) =>
        selectedOptionalIds.includes(option.id),
      ),
    [product?.optionalItems, selectedOptionalIds],
  );

  if (!isOpen || !product) {
    return null;
  }

  const selectedOptionalTotal = selectedOptionalItems.reduce(
    (acc, item) => acc + item.price,
    0,
  );
  const unitPrice =
    product.price + (selectedSize?.priceDelta ?? 0) + selectedOptionalTotal;

  function toggleOptional(id: string) {
    setSelectedOptionalIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function addToCart() {
    if (!product) {
      return;
    }

    const customizationParts = [
      selectedSize ? `Tamanho: ${selectedSize.label}` : null,
      selectedOptionalItems.length > 0
        ? `Opcionais: ${selectedOptionalItems.map((item) => item.label).join(", ")}`
        : null,
      customerNote.trim() ? `Obs.: ${customerNote.trim()}` : null,
    ].filter((item): item is string => Boolean(item));

    const cartItemId = [
      product.id,
      selectedSize?.id ?? "padrao",
      selectedOptionalItems.map((item) => item.id).sort().join("-") || "sem-opcionais",
      slugify(customerNote.trim() || "sem-obs"),
    ].join("--");

    const cartItem: CartItem = {
      ...product,
      cartItemId,
      quantity: 1,
      price: unitPrice,
      selectedSizeId: selectedSize?.id,
      selectedSizeLabel: selectedSize?.label,
      selectedSizePriceDelta: selectedSize?.priceDelta ?? 0,
      selectedOptionalItemIds: selectedOptionalItems.map((item) => item.id),
      selectedOptionalItemLabels: selectedOptionalItems.map((item) => item.label),
      selectedOptionalItemTotal: selectedOptionalTotal,
      customerNote: customerNote.trim(),
      customizationText: customizationParts.join(" | "),
      subtotal: unitPrice,
    };

    addCustomizedItem(cartItem);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-[rgba(17,10,7,0.55)] backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fechar personalizacao"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="absolute inset-x-3 bottom-3 top-3 overflow-hidden rounded-[32px] bg-[var(--surface)] shadow-[0_24px_55px_rgba(17,10,7,0.28)] sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88vh] sm:w-[640px] sm:-translate-x-1/2 sm:-translate-y-1/2">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              Personalizar item
            </p>
            <h2 className="mt-2 text-2xl font-black">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-[0_10px_22px_rgba(55,26,12,0.1)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(100%-88px)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-6">
            <div className="panel-subtle p-4 text-sm leading-6 text-[var(--muted)]">
              <p>{product.description}</p>
              {product.compositionText ? (
                <p className="mt-3">
                  <strong className="text-[var(--foreground)]">Composicao:</strong>{" "}
                  {product.compositionText}
                </p>
              ) : null}
            </div>

            {product.sizeOptions && product.sizeOptions.length > 0 ? (
              <section className="space-y-3">
                <p className="text-sm font-black uppercase tracking-[0.12em]">
                  Tamanho
                </p>
                <div className="grid gap-3">
                  {product.sizeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedSizeId(option.id)}
                      className={`rounded-[22px] border px-4 py-4 text-left transition-colors ${
                        selectedSizeId === option.id
                          ? "border-[var(--brand)] bg-[rgba(184,68,31,0.08)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{option.label}</span>
                        <span className="text-sm text-[var(--brand)]">
                          {option.priceDelta > 0
                            ? `+ ${formatCurrency(option.priceDelta)}`
                            : "Sem acrescimo"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {product.optionalItems && product.optionalItems.length > 0 ? (
              <section className="space-y-3">
                <p className="text-sm font-black uppercase tracking-[0.12em]">
                  Opcionais
                </p>
                <div className="grid gap-3">
                  {product.optionalItems.map((option) => {
                    const checked = selectedOptionalIds.includes(option.id);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleOptional(option.id)}
                        className={`rounded-[22px] border px-4 py-4 text-left transition-colors ${
                          checked
                            ? "border-[var(--brand)] bg-[rgba(184,68,31,0.08)]"
                            : "border-[var(--line)] bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                checked
                                  ? "bg-[var(--brand)] text-white"
                                  : "bg-[var(--surface)] text-[var(--muted)]"
                              }`}
                            >
                              {checked ? <Check size={14} /> : <Plus size={14} />}
                            </span>
                            <span className="font-bold">{option.label}</span>
                          </div>
                          <span className="text-sm text-[var(--brand)]">
                            + {formatCurrency(option.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {product.allowCustomerNote ? (
              <label className="block space-y-2">
                <span className="text-sm font-black uppercase tracking-[0.12em]">
                  Observacao do cliente
                </span>
                <textarea
                  value={customerNote}
                  onChange={(event) => setCustomerNote(event.target.value.slice(0, 240))}
                  rows={3}
                  placeholder="Ex.: sem cebola, bem passado, caprichar no molho"
                  className="w-full rounded-[22px] border border-[var(--line)] bg-white px-4 py-3"
                />
              </label>
            ) : null}

            <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(35,21,15,0.98),rgba(57,31,21,0.92))] p-5 text-white">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Valor unitario</span>
                <span>{formatCurrency(unitPrice)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-2xl font-black">
                <span>Adicionar 1 item</span>
                <span>{formatCurrency(unitPrice)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={addToCart}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white"
              >
                Adicionar ao carrinho
              </button>
              <button
                type="button"
                onClick={onClose}
                className="glass-pill inline-flex min-h-12 items-center justify-center rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.16em]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
