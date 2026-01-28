const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiFetch = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  const nextOptions: RequestInit = { ...(options || {}) };

  if (nextOptions.body) {
    const headers = new Headers(nextOptions.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
    nextOptions.headers = headers;
  }

  nextOptions.credentials = "include";

  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, nextOptions);

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw { status: res.status, ...(json ?? {}), msg: json?.msg ?? `HTTP ${res.status}` };
  }

  return json as T;
};
