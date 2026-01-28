import { apiFetch } from "./client";
import type { RsData } from "./types";

export type MeResponse = {
  id: number;
  email: string;
  nickname: string;
};

export function getMe() {
  return apiFetch<RsData<MeResponse>>("/api/v1/members/me");
}

export function changePassword(oldPassword: string, newPassword: string) {
  return apiFetch<RsData<null>>("/api/v1/members/me/password", {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}
