const API_BASE_URL = "http://localhost:3333";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function api<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorData?.message || "Falha ao se comunicar com o backend.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
