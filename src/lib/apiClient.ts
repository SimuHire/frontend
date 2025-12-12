import { getAuthToken } from "./auth";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiClientOptions {
  basePath?: string;
  authToken?: string | null;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
  details?: unknown;
}

const DEFAULT_BASE_PATH = "/api";

function normalizeUrl(basePath: string, path: string): string {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function extractErrorMessage(errorBody: unknown, status: number): string {
  if (typeof errorBody === "object" && errorBody !== null) {
    const candidate = errorBody as { message?: unknown; detail?: unknown };

    if (typeof candidate.message === "string") return candidate.message;

    if (typeof candidate.detail === "string") return candidate.detail;

    if (Array.isArray(candidate.detail) && candidate.detail.length > 0) {
      const first = candidate.detail[0] as { msg?: unknown };
      if (first && typeof first.msg === "string") return first.msg;
    }
  }

  return `Request failed with status ${status}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as unknown;
    } catch {
      return undefined;
    }
  }

  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

async function request<TResponse = unknown>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
  clientOptions: ApiClientOptions = {}
): Promise<TResponse> {
  const basePath = clientOptions.basePath ?? DEFAULT_BASE_PATH;

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const token =
    clientOptions.authToken ??
    (typeof window !== "undefined" ? getAuthToken() : null);

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(normalizeUrl(basePath, path), {
    method: options.method ?? "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body),
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await parseResponseBody(response);
    const error: ApiErrorShape = {
      message: extractErrorMessage(errorBody, response.status),
      status: response.status,
      details: errorBody,
    };
    throw error;
  }

  if (response.status === 204) return undefined as TResponse;

  return (await parseResponseBody(response)) as TResponse;
}

export interface LoginResponseUser {
  id: string | number;
  email: string;
  name?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer" | string;
  user?: LoginResponseUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export const apiClient = {
  get: <T = unknown>(path: string, clientOptions?: ApiClientOptions) =>
    request<T>(path, { method: "GET" }, clientOptions),

  post: <T = unknown>(
    path: string,
    body?: unknown,
    clientOptions?: ApiClientOptions
  ) => request<T>(path, { method: "POST", body }, clientOptions),

  put: <T = unknown>(
    path: string,
    body?: unknown,
    clientOptions?: ApiClientOptions
  ) => request<T>(path, { method: "PUT", body }, clientOptions),

  patch: <T = unknown>(
    path: string,
    body?: unknown,
    clientOptions?: ApiClientOptions
  ) => request<T>(path, { method: "PATCH", body }, clientOptions),

  delete: <T = unknown>(path: string, clientOptions?: ApiClientOptions) =>
    request<T>(path, { method: "DELETE" }, clientOptions),
};
