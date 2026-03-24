import Link from "next/link";
import { MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { PromoBanners } from "@/components/home/promo-banners";
import { formatDeliveryEstimate } from "@/lib/delivery";
import { formatCurrency } from "@/lib/format";
import { listProducts } from "@/lib/order-repository";
import { getResolvedStoreConfig } from "@/lib/white-label";
import { MenuClient } from "./menu-client";

export async function StorefrontPage() {
  const [products, store] = await Promise.all([
    listProducts(),
    getResolvedStoreConfig(),
  ]);

  return (
    <main className="pb-16">
      <section className="container-shell py-4 sm:py-6">
        <div className="panel-card overflow-hidden p-5 sm:p-7 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
                Pedido online da loja
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-black uppercase leading-[0.92] sm:text-5xl lg:text-6xl">
                Cardapio digital com ritmo de atendimento real
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Escolha burgers, combos, bebidas e adicionais em uma vitrine
                clara, com checkout rapido e pedido enviado direto para o
                WhatsApp da hamburgueria.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="glass-pill inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[var(--muted)]">
                  <MessageCircle size={16} className="text-[var(--brand)]" />
                  <span>{store.phoneDisplay}</span>
                </div>
                <div className="glass-pill inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[var(--muted)]">
                  <MapPin size={16} className="text-[var(--brand)]" />
                  <span>{store.address}</span>
                </div>
                <div className="glass-pill inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[var(--muted)]">
                  <ShoppingBag size={16} className="text-[var(--brand)]" />
                  <span>
                    Entrega a partir de {formatCurrency(store.deliveryFee)} |{" "}
                    {formatDeliveryEstimate(
                      store.estimatedDeliveryMin,
                      store.estimatedDeliveryMax,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(35,21,15,0.96),rgba(57,31,21,0.92))] p-5 text-white sm:p-6">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Acesso rapido
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--foreground)]">
                      <ShoppingBag size={20} />
                    </div>
                    <h2 className="mt-4 text-xl font-black uppercase">
                      Pedido pelo celular
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/74">
                      O cliente escolhe os itens, preenche a entrega e envia tudo
                      para o WhatsApp em poucos passos.
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      {store.deliveryAreas.length > 0
                        ? `${store.deliveryAreas.length} bairros configurados com taxa e prazo`
                        : "Taxa padrao e previsao editaveis para cada cliente"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/checkout"
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[var(--foreground)]"
                    >
                      Ir para checkout
                    </Link>
                    <Link
                      href={`https://wa.me/${store.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/8 px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-white"
                    >
                      WhatsApp da loja
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PromoBanners />
      <MenuClient products={products} />
    </main>
  );
}
