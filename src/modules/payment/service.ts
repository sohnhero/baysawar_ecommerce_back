import axios from "axios";

const BICTORYS_BASE_URL = process.env.BICTORYS_ENV === "live"
  ? "https://api.bictorys.com"
  : "https://api.test.bictorys.com";

const bictorysClient = axios.create({
  baseURL: BICTORYS_BASE_URL,
  headers: {
    "X-Api-Key": process.env.BICTORYS_API_KEY!,
    "Content-Type": "application/json",
  },
});

export interface BictorysChargePayload {
  merchantReference: string;
  amount: number;
  currency: string;
  country: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface BictorysChargeResponse {
  id: string;
  status: string;
  checkoutUrl?: string;
  paymentLink?: string;
  [key: string]: any;
}

// Maps our internal paymentMethod values to Bictorys payment_type query param
const PAYMENT_TYPE_MAP: Record<string, string> = {
  wave_money: "wave_money",
  wave: "wave_money",
  orange_money: "orange_money",
  om: "orange_money",
  card: "card",
};

export const initiatePayment = async (
  payload: BictorysChargePayload,
  paymentMethod?: string
): Promise<BictorysChargeResponse> => {
  const paymentType = paymentMethod ? PAYMENT_TYPE_MAP[paymentMethod] : undefined;
  const url = paymentType
    ? `/pay/v1/charges?payment_type=${paymentType}`
    : "/pay/v1/charges";

  console.log("[Bictorys] POST", BICTORYS_BASE_URL + url);
  console.log("[Bictorys] Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await bictorysClient.post(url, payload);
    console.log("[Bictorys] Response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err: any) {
    console.error("[Bictorys] Error status:", err.response?.status);
    console.error("[Bictorys] Error body:", JSON.stringify(err.response?.data, null, 2));
    throw err;
  }
};

export const getTransaction = async (
  transactionId: string
): Promise<any> => {
  const response = await bictorysClient.get(`/transactions/${transactionId}`);
  return response.data;
};
