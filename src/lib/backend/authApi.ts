// src/lib/backend/authApi.ts
import { apiFetch } from "./client";
import type { RsData } from "./types";

export type AuthResult = { memberId: number; apiKey: string };

type CheckEmailResponse = { available: boolean };
type CheckNicknameResponse = { available: boolean };

export function signup(email: string, password: string, nickname: string) {
  return apiFetch<RsData<null>>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname }),
  });
}

export async function login(email: string, password: string) {
  const rs = await apiFetch<RsData<AuthResult>>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // 🔑 서버가 준 apiKey를 localStorage에 저장 (401 복구용 마스터키)
  if (rs.data?.apiKey) {
    localStorage.setItem("apiKey", rs.data.apiKey);
  }

  return rs;
}

export async function logout() {
  // ✅ 로그아웃 시 마스터키도 함께 폐기 (보안상 매우 중요!)
  if (typeof window !== "undefined") {
    localStorage.removeItem("apiKey");
  }

  return apiFetch<RsData<null>>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function checkEmailAvailable(email: string) {
  const rs = await apiFetch<RsData<CheckEmailResponse>>(
    `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`
  );
  return rs.data.available; // true면 사용 가능
}

export async function checkNicknameAvailable(nickname: string) {
  const rs = await apiFetch<RsData<CheckNicknameResponse>>(
    `/api/v1/members/check-nickname?nickname=${encodeURIComponent(nickname)}`
  );
  return rs.data.available; // true면 사용 가능
}
