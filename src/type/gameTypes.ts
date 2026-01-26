// src/lib/gameTypes.ts
export type GameDetailResponse = {
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
  imageId: string | null
) {
  if (!template || !imageId) return null;
  return template.replace("{size}", size).replace("{id}", imageId);
}

export function buildIgdbImageUrl(size: string, imageId: string | null) {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}
