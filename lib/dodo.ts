import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_API_KEY;

if (!apiKey) {
  console.warn("Warning: DODO_API_KEY environment variable is missing.");
}

export const dodo = new DodoPayments({
  bearerToken: apiKey || "placeholder_api_key",
  environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});
