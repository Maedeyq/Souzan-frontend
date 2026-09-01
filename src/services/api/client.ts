import { STORAGE_KEYS } from "@/constants/storage";
import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEYS.accessToken);
}

function getRefreshToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, access);
  if (refresh) localStorage.setItem(STORAGE_KEYS.refreshToken, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(`${env.apiBaseUrl}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = (await response.json()) as { access: string; refresh?: string };
  setTokens(data.access, data.refresh);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, headers, ...requestOptions } = options;

  const send = (token: string | null) => {
    const requestHeaders = new Headers(headers);
    if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
      requestHeaders.set("Content-Type", "application/json");
    }
    if (auth && token) requestHeaders.set("Authorization", `Bearer ${token}`);

    return fetch(`${env.apiBaseUrl}/${path.replace(/^\//, "")}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  };

  let response = await send(getAccessToken());
  if (response.status === 401 && auth) {
    const accessToken = await refreshAccessToken();
    if (accessToken) response = await send(accessToken);
  }

  if (!response.ok) {
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // The API may return an empty or non-JSON error response.
    }
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
