"use client";

import { useRouter } from "next/navigation";

export type SearchFilters = {
  genre?: string;
  platform?: string;
};

export function useGameSearch() {
  const router = useRouter();

  const search = (keyword: string, filters?: SearchFilters) => {
    if (!keyword.trim()) return false;

    const params = new URLSearchParams();
    params.set("keyword", keyword);

    if (filters?.genre) {
      params.set("genre", filters.genre);
    }

    if (filters?.platform) {
      params.set("platform", filters.platform);
    }

    router.push(`/search?${params.toString()}`);
    return true;
  };

  return { search };
}
