const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 공통 fetch 래퍼
 * - 쿠키 포함(credentials: "include")
 * - JSON 응답 파싱
 * - res.ok 아니면 { status, resultCode, msg, data } 형태로 throw
 */
export const apiFetch = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  if (!NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const nextOptions: RequestInit = { ...(options || {}) };

  // body가 있으면 Content-Type 자동 세팅
  if (nextOptions.body) {
    const headers = new Headers(nextOptions.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
    nextOptions.headers = headers;
  }

  // 쿠키 기반 인증이라면 필수
  nextOptions.credentials = "include";

  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, nextOptions);

  // 응답이 JSON 아닐 수도 있으니 안전하게
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // 에러를 객체로 던져서 pickMsg 같은 유틸이 사용 가능
    throw {
      status: res.status,
      ...(json ?? {}),
      msg: json?.msg ?? `HTTP ${res.status}`,
    };
  }

  return json as T;
};
