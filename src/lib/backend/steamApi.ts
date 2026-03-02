import { apiFetch } from "./client";
import type { RsData } from "./types";

/** Get the Steam OpenID auth redirect URL */
export function getSteamAuthUrl() {
  return apiFetch<RsData<{ url: string }>>(`/api/v1/steam/auth/url`).then(
    (r) => r.data
  );
}

/** Trigger Steam library import (after getting steamId from callback) */
export function importSteamGames(memberId: number, steamId: string) {
  return apiFetch<RsData<{ jobId: string }>>(
    `/api/v1/steam/members/${memberId}/library/import/steam`,
    {
      method: "POST",
      body: JSON.stringify({ steamId }),
    }
  ).then((r) => r.data);
}
