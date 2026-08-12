// Thin fetch wrapper around the souzan DRF backend.
// Handles JWT access/refresh tokens stored in localStorage.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

const ACCESS_TOKEN_KEY = "souzan_access_token";
const REFRESH_TOKEN_KEY = "souzan_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data.access);
  return data.access;
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach Authorization header, default true
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const doFetch = async (token: string | null) => {
    const finalHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
    });
  };

  let res = await doFetch(getAccessToken());

  // Access token expired: try refreshing once, then retry the request.
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await doFetch(newAccess);
    }
  }

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { ApiError };
