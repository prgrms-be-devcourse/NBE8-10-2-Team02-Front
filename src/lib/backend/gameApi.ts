// src/lib/gameApi.ts
import { GameDetailResponse, GameVideoResponse, SimilarGameResponse } from "@/type/gameTypes"

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" }); // 필요하면 revalidate로 바꿔도 됨
  if (!res.ok) throw new Error(`Failed: ${url} (${res.status})`);
  return res.json();
}

export function getGameDetail(igdbId: number) {
  return fetchJson<GameDetailResponse>(`${BASE}/api/v1/games/${igdbId}`);
}

export function getGameVideo(igdbId: number) {
  return fetchJson<GameVideoResponse>(`${BASE}/api/v1/games/${igdbId}/video`);
}

export function getSimilarGames(igdbId: number) {
  return fetchJson<SimilarGameResponse[]>(`${BASE}/api/v1/games/${igdbId}/similarGames`);
}
