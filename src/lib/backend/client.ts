const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 에러 객체에 상태 코드를 포함시키기 위한 커스텀 인터페이스
interface ApiError extends Error {
  status?: number;
  msg?: string;
  data?: any;
}

export const apiFetch = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  if (!NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const nextOptions: RequestInit = { ...(options || {}), credentials: "include" };

  // 1. 기본 헤더 설정
  const headers = new Headers(nextOptions.headers || {});
  if (nextOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  nextOptions.headers = headers;

  // 2. 1차 요청 시도
  let res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, nextOptions);

  // 🚨 [핵심] 401 Unauthorized (5분 만료) 발생 시 처리
  if (res.status === 401) {
    const savedApiKey = typeof window !== "undefined" ? localStorage.getItem("apiKey") : null;

    if (savedApiKey) {
      // 백엔드 필터는 "Bearer [ApiKey] [AccessToken]" 형식을 인식합니다.
      // 여기서는 토큰이 만료되었으므로 AccessToken 자리에 임시 값을 넣거나 비워둡니다.
      const retryHeaders = new Headers(nextOptions.headers);
      retryHeaders.set("Authorization", `Bearer ${savedApiKey} expired_token`);

      const retryRes = await fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, {
        ...nextOptions,
        headers: retryHeaders,
      });

      if (retryRes.ok) res = retryRes;
    }
  }

  // 3. 응답 파싱
  const json = await res.json().catch(() => null);

  // 4. [수정] 객체가 아닌 Error 객체를 던져서 [object Object] 방지
  if (!res.ok) {
    const error: ApiError = new Error(json?.msg || `HTTP Error ${res.status}`);
    error.status = res.status;
    error.msg = json?.msg;
    error.data = json?.data;
    throw error;
  }

  return json as T;
};