import { apiFetch } from "./client";

export type StatusEnum =
  | "PLAYING"
  | "COMPLETED"
  | "DROPPED"
  | "ON_HOLD"
  | "PLAN_TO_PLAY";

export function addToLibrary(
  memberId: number,
  body: {
    gameId: number;
    platform: string;
    playtime: number;
    isFavorite: boolean;
    status: StatusEnum;
  },
) {
  return apiFetch<unknown>(`/api/v1/members/${memberId}/library`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
