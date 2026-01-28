// src/lib/backend/authApi.ts
import { apiFetch } from "./client";
import type { RsData } from "./types";

export type AuthResult = null;

type CheckEmailResponse = { available: boolean };
type CheckNicknameResponse = { available: boolean };

export function signup(email: string, password: string, nickname: string) {
  return apiFetch<RsData<AuthResult>>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname }),
  });
}

export function login(email: string, password: string) {
  return apiFetch<RsData<AuthResult>>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<RsData<AuthResult>>("/api/v1/auth/logout", {
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
