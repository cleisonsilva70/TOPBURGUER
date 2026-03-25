"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { paymentLabels, paymentStatusLabels } from "@/lib/constants";
import type { Order, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/cozinha/logout-button";

async function fetchAtendimentoOrders(): Promise<Order[]> {
  const response = await fetch("/api/pedidos", {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("401");
    }

    throw new Error("Nao foi possivel carregar os pedidos do atendimento.");
  }

  return response.json();
}

function matchesSelectedDateFilter(
  createdAtValue: string,
  dateFilter: "HOJE" | "ONTEM" | "7_DIAS" | "DATA",
  customDate: string,
) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfSevenDays = new Date(startOfToday);
  startOfSevenDays.setDate(startOfSevenDays.getDate() - 6);
  const createdAt = new Date(createdAtValue);

  if (dateFilter === "HOJE") {
    return createdAt >= startOfToday;
  }

  if (dateFilter === "ONTEM") {
    return createdAt >= startOfYesterday && createdAt < startOfToday;
  }

  if (dateFilter === "7_DIAS") {
    return createdAt >= startOfSevenDays;
  }

  if (dateFilter === "DATA") {
    return customDate ? createdAt.toISOString().slice(0, 10) === customDate : true;
  }

  return true;
}

export function ServiceBoard({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [boardError, setBoardError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"PENDENTES" | "PAGOS">("PENDENTES");
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "TODOS">("TODOS");
  const [dateFilter, setDateFilter] = useState<"HOJE" | "ONTEM" | "7_DIAS" | "DATA">("HOJE");
  const [customDate, setCustomDate] = useState("");

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const nextOrders = await fetchAtendimentoOrders();
        setOrders(nextOrders);
        setBoardError("");
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          setBoardError("Sua sessao expirou. Faca login novamente.");
          router.push("/acesso-cozinha");
          return;
        }

        setBoardError("Nao foi possivel atualizar o painel de atendimento.");
      }
    }, 12000);

    return () => window.clearInterval(timer);
  }, [router]);

  const ordersInSelectedPeriod = useMemo(
    () =>
      orders.filter((order) =>
        matchesSelectedDateFilter(order.createdAt, dateFilter, customDate),
      ),
    [customDate, dateFilter, orders],
  );

  const totalPendingValue = useMemo(
    () =>
      ordersInSelectedPeriod
        .filter((order) => order.paymentStatus === "PENDENTE")
        .reduce((acc, order) => acc + order.total, 0),
    [ordersInSelectedPeriod],
  );

  const paidOrdersCount = useMemo(
    () => ordersInSelectedPeriod.filter((order) => order.paymentStatus === "PAGO").length,
    [ordersInSelectedPeriod],
  );

  const pendingOrdersCount = useMemo(
    () => ordersInSelectedPeriod.filter((order) => order.paymentStatus === "PENDENTE").length,
    [ordersInSelectedPeriod],
  );
  const delayedOrdersCount = useMemo(
    () =>
      ordersInSelectedPeriod.filter((order) => {
        if (order.paymentStatus !== "PENDENTE") {
          return false;
        }

        return Date.now() - new Date(order.createdAt).getTime() >= 15 * 60 * 1000;
      }).length,
    [ordersInSelectedPeriod],
  );
  const deliveredOrdersCount = useMemo(
    () => ordersInSelectedPeriod.filter((order) => order.status === "ENTREGUE").length,
    [ordersInSelectedPeriod],
  );
  const totalRevenue = useMemo(
    () =>
      ordersInSelectedPeriod
        .filter((order) => order.paymentStatus === "PAGO")
        .reduce((acc, order) => acc + order.total, 0),
    [ordersInSelectedPeriod],
  );
  const averageTicket = useMemo(
    () => (paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0),
    [paidOrdersCount, totalRevenue],
  );
  const recentOrders = useMemo(() => ordersInSelectedPeriod.slice(0, 3), [ordersInSelectedPeriod]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        filter === "PENDENTES"
          ? order.paymentStatus === "PENDENTE"
          : order.paymentStatus === "PAGO";
      const matchesPayment =
        paymentFilter === "TODOS" || order.paymentMethod === paymentFilter;
      const matchesDate = matchesSelectedDateFilter(order.createdAt, dateFilter, customDate);

      const matchesSearch =
        !term ||
        order.customerName.toLowerCase().includes(term) ||
        order.orderNumberFormatted.toLowerCase().includes(term) ||
        order.phone.toLowerCase().includes(term);

      return matchesStatus && matchesPayment && matchesDate && matchesSearch;
    });
  }, [filter, orders, paymentFilter, search, dateFilter, customDate]);

  function getWaitMinutes(createdAt: string) {
    return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
  }

  async function markAsPaid(orderId: string) {
    setLoadingId(orderId);
    setBoardError("");

    try {
      const response = await fetch(`/api/pedidos/${orderId}/pagamento/manual`, {
        method: "PATCH",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setBoardError("Sua sessao expirou. Faca login novamente.");
          router.push("/acesso-cozinha");
          return;
        }

        const data = await response.json();
        setBoardError(data.error ?? "Nao foi possivel marcar o pedido como pago.");
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus: "PAGO",
              }
            : order,
        ),
      );
    } catch {
      setBoardError("Falha ao confirmar o pagamento no atendimento.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="panel-card luxury-section overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="glass-pill inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              Atendimento
            </p>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-[-0.04em] sm:text-4xl">
              Atendimento e liberacao de pedidos
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Confirme os pedidos pagos e libere apenas o que estiver pronto para
              seguir para a cozinha.
            </p>
          </div>
          <div className="flex w-full max-w-[620px] flex-col gap-3 self-start lg:items-end">
            <div className="grid w-full gap-3 md:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(35,21,15,0.96),rgba(57,31,21,0.92))] px-5 py-4 text-white shadow-[0_20px_50px_rgba(35,21,15,0.24)]">
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Aguardando pagamento</p>
                <strong className="mt-2 block text-3xl font-black">{pendingOrdersCount}</strong>
                <p className="mt-2 text-xs text-white/70">{formatCurrency(totalPendingValue)}</p>
              </div>
              <div className="rounded-[26px] border border-[var(--line)] bg-white/80 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Pagos no periodo</p>
                <strong className="mt-2 block text-3xl font-black">{paidOrdersCount}</strong>
              </div>
              <div className="rounded-[26px] border border-[rgba(184,68,31,0.12)] bg-[rgba(184,68,31,0.08)] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Em atraso</p>
                <strong className="mt-2 block text-3xl font-black text-[var(--danger)]">
                  {delayedOrdersCount}
                </strong>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {boardError ? (
        <section className="panel-card p-5">
          <p className="rounded-2xl border border-[rgba(179,63,47,0.22)] bg-[rgba(179,63,47,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {boardError}
          </p>
        </section>
      ) : null}

      <section className="panel-card luxury-section p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
              Periodo dos indicadores
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Escolha o periodo que deve ser considerado nos blocos de faturamento,
              ticket medio e totais do atendimento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["HOJE", "Hoje"],
              ["ONTEM", "Ontem"],
              ["7_DIAS", "Ultimos 7 dias"],
              ["DATA", "Data especifica"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDateFilter(value)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  dateFilter === value
                    ? "bg-[var(--accent)] text-[var(--foreground)]"
                    : "glass-pill text-[var(--foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
            {dateFilter === "DATA" ? (
              <input
                type="date"
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel-card luxury-section p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
            Pagos
          </p>
          <p className="mt-4 text-4xl font-black">{paidOrdersCount}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Pedidos com pagamento confirmado dentro do periodo filtrado.
          </p>
        </article>
        <article className="panel-card luxury-section p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
            Pendentes
          </p>
          <p className="mt-4 text-4xl font-black">{pendingOrdersCount}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Pedidos aguardando confirmacao no atendimento.
          </p>
        </article>
        <article className="panel-card luxury-section p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
            Faturamento
          </p>
          <p className="mt-4 text-4xl font-black">{formatCurrency(totalRevenue)}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Total pago registrado no periodo selecionado.
          </p>
        </article>
        <article className="panel-card luxury-section p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
            Ticket medio
          </p>
          <p className="mt-4 text-4xl font-black">{formatCurrency(averageTicket)}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Media de venda considerando os pedidos pagos no periodo.
          </p>
        </article>
        <article className="panel-card luxury-section p-5 md:col-span-2 xl:col-span-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
                Historico rapido
              </p>
              <p className="mt-4 text-4xl font-black">{ordersInSelectedPeriod.length}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {deliveredOrdersCount} pedidos ja foram concluidos neste periodo.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[22px] border border-[var(--line)] bg-white/80 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
                    Pedido {order.orderNumberFormatted}
                  </p>
                  <p className="mt-2 text-sm font-bold">{order.customerName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {order.displayTime} | {order.paymentStatus === "PAGO" ? "Pago" : "Pendente"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="xl:col-span-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-4">
            <label className="relative block w-full max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por cliente, telefone ou pedido"
                className="w-full rounded-full border border-[var(--line)] bg-white py-3 pl-11 pr-4 text-sm"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {[
                ["PENDENTES", `Pendentes (${pendingOrdersCount})`],
                ["PAGOS", `Pagos (${paidOrdersCount})`],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as "PENDENTES" | "PAGOS")}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                    filter === value
                      ? "bg-[var(--brand)] text-white"
                      : "glass-pill text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="panel-subtle flex flex-col gap-3 rounded-[24px] p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
                  Filtro por pagamento no historico
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Filtre a lista abaixo por Pix, dinheiro ou cartao.
                </p>
              </div>
              {(["TODOS", "PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO"] as const).map(
                (value) => (
                  <div key={value} className="inline-flex">
                    <button
                      type="button"
                      onClick={() => setPaymentFilter(value)}
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                        paymentFilter === value
                          ? "bg-[var(--foreground)] text-white"
                          : "glass-pill text-[var(--foreground)]"
                      }`}
                    >
                      {value === "TODOS" ? "Todos pagamentos" : paymentLabels[value]}
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="panel-card luxury-section p-8 text-center text-sm text-[var(--muted)] xl:col-span-2">
            Nenhum pedido encontrado para esse filtro.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article
              key={order.id}
              className={cn(
                "panel-card luxury-section relative overflow-hidden p-6",
                loadingId === order.id ? "opacity-75" : "",
                getWaitMinutes(order.createdAt) >= 15 && order.paymentStatus === "PENDENTE"
                  ? "border-[rgba(179,63,47,0.26)] shadow-[0_0_0_2px_rgba(179,63,47,0.08)]"
                  : order.paymentStatus === "PENDENTE"
                    ? "border-[rgba(184,68,31,0.18)]"
                    : "",
              )}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[color-mix(in_srgb,var(--accent)_32%,transparent)] blur-2xl" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
                    Pedido {order.orderNumberFormatted}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{order.customerName}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {order.displayTime} | {paymentStatusLabels[order.paymentStatus]}
                  </p>
                  {Date.now() - new Date(order.createdAt).getTime() <= 8 * 60 * 1000 ? (
                    <p className="mt-2 inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--foreground)]">
                      Pedido novo
                    </p>
                  ) : null}
                  {getWaitMinutes(order.createdAt) >= 15 && order.paymentStatus === "PENDENTE" ? (
                    <p className="mt-2 inline-flex rounded-full bg-[rgba(179,63,47,0.12)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--danger)]">
                      Aguardando ha {getWaitMinutes(order.createdAt)} min
                    </p>
                  ) : null}
                </div>
                <span className="glass-pill rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground)]">
                  {paymentLabels[order.paymentMethod]}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="panel-subtle p-4 text-sm leading-7 text-[var(--muted)]">
                  <p><strong className="text-[var(--foreground)]">Telefone:</strong> {order.phone}</p>
                  <p><strong className="text-[var(--foreground)]">Endereco:</strong> {order.address}, {order.houseNumber}</p>
                  {order.deliveryArea ? (
                    <p><strong className="text-[var(--foreground)]">Bairro:</strong> {order.deliveryArea}</p>
                  ) : null}
                  {order.reference ? (
                    <p><strong className="text-[var(--foreground)]">Referencia:</strong> {order.reference}</p>
                  ) : null}
                </div>

                <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(35,21,15,0.98),rgba(57,31,21,0.92))] p-4 text-white shadow-[0_18px_38px_rgba(35,21,15,0.18)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Itens
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/85">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {"\u2022"} {item.productName}
                        <br />
                        {item.quantity}x {formatCurrency(item.unitPrice)} = {formatCurrency(item.subtotal)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="glass-pill rounded-[18px] px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Total do pedido</span>
                  <strong className="ml-3 text-lg text-[var(--brand)]">{formatCurrency(order.total)}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => markAsPaid(order.id)}
                  disabled={loadingId === order.id || order.paymentStatus === "PAGO"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_30px_rgba(145,47,18,0.22)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[rgba(184,68,31,0.45)] disabled:shadow-none"
                >
                  <CheckCircle2 size={18} />
                  {loadingId === order.id
                    ? "Confirmando..."
                    : order.paymentStatus === "PAGO"
                      ? "Pagamento confirmado"
                      : "Confirmar pagamento"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
