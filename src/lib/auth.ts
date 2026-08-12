import { apiFetch, setTokens, clearTokens } from "./api";

interface TokenPair {
  access: string;
  refresh: string;
}

export async function login(username: string, password: string): Promise<void> {
  const tokens = await apiFetch<TokenPair>("/token/", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ username, password }),
  });
  setTokens(tokens.access, tokens.refresh);
}

export function logout(): void {
  clearTokens();
}

export interface CustomerRegistrationPayload {
  username: string;
  email: string;
  password: string;
}

export async function registerCustomer(
  payload: CustomerRegistrationPayload
): Promise<void> {
  await apiFetch("/accounts/register/customer/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export interface TailorRegistrationPayload {
  username: string;
  email: string;
  password: string;
}

export async function registerTailor(
  payload: TailorRegistrationPayload
): Promise<void> {
  await apiFetch("/accounts/register/tailor/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}
