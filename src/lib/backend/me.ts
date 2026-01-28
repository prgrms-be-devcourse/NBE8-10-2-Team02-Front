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

export function changeNickname(nickname: string) {
  return apiFetch<RsData<null>>("/api/v1/members/me/nickname", {
    method: "PUT",
    body: JSON.stringify({ nickname }),
  });
}
