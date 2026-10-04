function config() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal keys are not set");
  const base = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  return { id, secret, base };
}

/** PayPal doesn't support every currency (notably INR for most accounts). */
const PAYPAL_CURRENCIES = ["USD", "EUR"];

export function paypalAvailable(currency: string) {
  return !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET && PAYPAL_CURRENCIES.includes(currency);
}

async function accessToken() {
  const { id, secret, base } = config();
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Amounts are stored in minor units (cents), PayPal wants a decimal string. */
export function toPaypalValue(minor: number) {
  return (minor / 100).toFixed(2);
}

export async function createPaypalOrder(amountMinor: number, currency: string, referenceId: string) {
  const { base } = config();
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ reference_id: referenceId, amount: { currency_code: currency, value: toPaypalValue(amountMinor) } }],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal order failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string };
}

export type PaypalCapture = {
  status?: string;
  purchase_units?: {
    payments?: { captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[] };
  }[];
};

export async function capturePaypalOrder(orderId: string) {
  const { base } = config();
  const res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as PaypalCapture;
}
