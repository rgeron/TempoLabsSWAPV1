
import { STRIPE_API_URL } from "@/lib/config";

export async function postStripeRequest<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${STRIPE_API_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Failed to process request at ${endpoint}`);
  }
  return response.json();
}