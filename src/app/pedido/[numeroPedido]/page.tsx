import { PaymentOrderPanel } from "@/components/checkout/payment-order-panel";
import { getPublicOrderPaymentContextByNumber } from "@/lib/order-repository";

type PedidoPageProps = {
  params: Promise<{ numeroPedido: string }>;
  searchParams: Promise<{
    orderId?: string;
    whatsapp?: string;
    paymentMethod?: "PIX" | "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO";
    paymentCode?: string;
    provider?: string;
    status?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
  searchParams,
}: PedidoPageProps) {
  const { numeroPedido } = await params;
  const { orderId, whatsapp, paymentMethod, paymentCode, provider, status } =
    await searchParams;
  const paymentContext = await getPublicOrderPaymentContextByNumber(numeroPedido);

  return (
    <PaymentOrderPanel
      orderId={orderId ?? paymentContext.id}
      orderNumber={numeroPedido}
      whatsappUrl={whatsapp ?? paymentContext.whatsappUrl}
      paymentMethod={paymentMethod ?? paymentContext.paymentMethod}
      paymentCode={paymentCode}
      paymentProvider={provider ?? paymentContext.paymentProvider ?? undefined}
      gatewayStatus={status}
    />
  );
}
