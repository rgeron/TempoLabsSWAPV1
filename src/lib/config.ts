export const CLIENT_URL =
  import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

export const STRIPE_API_URL = `${SERVER_URL}/api`;
