const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

export const env = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, ""),
} as const;
