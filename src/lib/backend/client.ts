const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiFetch = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<T> => {
<<<<<<< HEAD
=======
  if (!NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

>>>>>>> 6433768 (refactor: #22 페이지 이동 시 me 호출 수정)
  const nextOptions: RequestInit = { ...(options || {}) };

  if (nextOptions.body) {
    const headers = new Headers(nextOptions.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
    nextOptions.headers = headers;
  }

  nextOptions.credentials = "include";

  const base = NEXT_PUBLIC_API_BASE_URL ?? "";
  const res = await fetch(`${base}${url}`, nextOptions);

  const json = await res.json().catch(() => null);

  if (!res.ok) {
<<<<<<< HEAD
    // 백엔드 RsData 형식이면 msg/resultCode가 들어있을 것
=======
>>>>>>> 6433768 (refactor: #22 페이지 이동 시 me 호출 수정)
    throw {
      status: res.status,
      ...(json ?? {}),
      msg: json?.msg ?? `HTTP ${res.status}`,
    };
  }

  return json as T;
};
