import type { CheckoutInput, PaymentMethod } from "./types";

export type HostedPaymentSession = {
  provider: "ASAAS";
  externalId: string;
  paymentUrl: string;
};

type CreateHostedPaymentParams = {
  orderNumberFormatted: string;
  checkout: CheckoutInput;
  total: number;
};

type AsaasCustomerResponse = {
  id?: string;
};

type AsaasPaymentResponse = {
  id?: string;
  invoiceUrl?: string;
};

function getAsaasBaseUrl() {
  return process.env.ASAAS_ENVIRONMENT === "production"
    ? "https://api.asaas.com"
    : "https://api-sandbox.asaas.com";
}

function getAsaasBillingType(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "PIX":
      return "PIX";
    case "CARTAO_CREDITO":
      return "CREDIT_CARD";
    case "CARTAO_DEBITO":
      return "UNDEFINED";
    default:
      return null;
  }
}

function sanitizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function buildDueDateLabel() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  return dueDate.toISOString().slice(0, 10);
}

export function isHostedPaymentEnabled() {
  return Boolean(process.env.ASAAS_API_KEY && process.env.APP_BASE_URL);
}

async function createAsaasCustomer(checkout: CheckoutInput) {
  const response = await fetch(`${getAsaasBaseUrl()}/v3/customers`, {
    method: "POST",
    headers: {
      access_token: process.env.ASAAS_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: checkout.customerName,
      mobilePhone: sanitizePhone(checkout.phone),
      notificationDisabled: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Asaas customer error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as AsaasCustomerResponse;

  if (!data.id) {
    throw new Error("Asaas customer returned no id.");
  }

  return data.id;
}

export async function createHostedPaymentSession(
  params: CreateHostedPaymentParams,
): Promise<HostedPaymentSession | null> {
  if (!isHostedPaymentEnabled()) {
    return null;
  }

  const billingType = getAsaasBillingType(params.checkout.paymentMethod);

  if (!billingType) {
    return null;
  }

  const appBaseUrl = process.env.APP_BASE_URL;

  if (!appBaseUrl) {
    return null;
  }

  const customerId = await createAsaasCustomer(params.checkout);
  const returnUrl = `${appBaseUrl}/pedido/${encodeURIComponent(params.orderNumberFormatted)}`;

  const response = await fetch(`${getAsaasBaseUrl()}/v3/payments`, {
    method: "POST",
    headers: {
      access_token: process.env.ASAAS_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: customerId,
      billingType,
      value: Number(params.total.toFixed(2)),
      dueDate: buildDueDateLabel(),
      description: `Pedido ${params.orderNumberFormatted}`,
      externalReference: params.orderNumberFormatted,
      callback: {
        successUrl: returnUrl,
        autoRedirect: true,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Asaas payment error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as AsaasPaymentResponse;

  if (!data.id || !data.invoiceUrl) {
    throw new Error("Asaas payment returned incomplete data.");
  }

  return {
    provider: "ASAAS",
    externalId: data.id,
    paymentUrl: data.invoiceUrl,
  };
}
