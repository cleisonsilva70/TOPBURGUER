import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getResolvedStoreConfig } from "@/lib/white-label";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await getResolvedStoreConfig();

  return (
    <main className="container-shell py-8 pb-16 sm:py-12">
      <div className="panel-card luxury-section mb-6 overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              Finalizar pedido
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] sm:text-4xl">
              Falta pouco para enviar seu pedido
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Confira seus dados de entrega, escolha como vai pagar e avance para
              revisar tudo antes do envio.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="glass-pill inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.14em]"
            >
              Voltar ao cardapio
            </Link>
          </div>
        </div>
      </div>

      <CheckoutForm
        deliveryFee={store.deliveryFee ?? 0}
        estimatedDeliveryMin={store.estimatedDeliveryMin ?? 0}
        estimatedDeliveryMax={store.estimatedDeliveryMax ?? 0}
        deliveryAreas={store.deliveryAreas ?? []}
      />
    </main>
  );
}
