import type { User } from "@/types";

import { apiFetch, clearTokens, setTokens } from "./client";

interface TokenPair {
  access: string;
  refresh: string;
}

export interface CustomerRegistrationPayload {
  username: string;
  email: string;
  password: string;
}

export type TailorRegistrationPayload = CustomerRegistrationPayload;

export async function login(username: string, password: string): Promise<User> {
  const tokens = await apiFetch<TokenPair>("/token/", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ username, password }),
  });
  setTokens(tokens.access, tokens.refresh);
  return getCurrentUser();
}

export function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/accounts/me/");
}

export function logout(): void {
  clearTokens();
}

export async function registerCustomer(payload: CustomerRegistrationPayload): Promise<void> {
  await apiFetch("/accounts/register/customer/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function registerTailor(payload: TailorRegistrationPayload): Promise<void> {
  await apiFetch("/accounts/register/tailor/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}
