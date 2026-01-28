// src/lib/gameTypes.ts
export type GameDetailResponse = {
  gameId: number; // 내부 DB ID (리뷰 등 API 호출 시 사용)
  igdbId: number;
  gameName: string;
  summary: string;
  firstReleaseDate: string | null; // LocalDate가 JSON이면 "YYYY-MM-DD"
  coverImageId: string | null;
  coverUrlTemplate: string | null; // "https://images.../{size}/{id}.jpg"
  developers: string[];
  publishers: string[];
  genres: string[];
  platforms: string[];
};

export type ReviewDto = {
  id: number;
  title: string;
  createDate: string;
  modifyDate: string;
  authorId: number;
  authorNickName: string;
  gameId: number;
  gameName: string;
  content: string;
  rating: number;
};

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page
  size: number;
  last: boolean;
};

export type GameVideoResponse = {
  videoId: string;
  trailerEmbedUrl: string; // "https://www.youtube.com/embed/{id}" or ""
};

export type SimilarGameResponse = {
  igdbId: number;
  name: string;
  coverImageId: string | null;
};

export function buildCoverUrl(
  template: string | null,
  size: string,
  imageId: string | null,
) {
  if (!template || !imageId) return null;
  return template.replace("{size}", size).replace("{id}", imageId);
}

export function buildIgdbImageUrl(size: string, imageId: string | null) {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}
