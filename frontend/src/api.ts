const API_BASE_URL = "http://localhost:3333";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
  token?: string | null;
};

export async function api<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options?.method ?? "GET",
    headers: options?.isFormData
      ? options?.token
        ? {
            Authorization: `Bearer ${options.token}`
          }
        : undefined
      : {
          "Content-Type": "application/json",
          ...(options?.token
            ? {
                Authorization: `Bearer ${options.token}`
              }
            : {})
        },
    body: options?.body
      ? options.isFormData
        ? (options.body as BodyInit)
        : JSON.stringify(options.body)
      : undefined
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
