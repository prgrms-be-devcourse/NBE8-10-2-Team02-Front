"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import { useRouter, useSearchParams } from "next/navigation";

type Option = {
  id: number;
  name: string;
};

type PlatformOption = {
  code: string; // "PC", "PS"
  name: string; // "PlayStation"
};

export default function SearchFilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [genres, setGenres] = useState<Option[]>([]);
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);

  // ✅ URL 기준으로 현재 선택값 결정
  const genre = params.get("genre") ?? "";
  const platform = params.get("platform") ?? "";

  const updateParam = (key: "genre" | "platform", value: string) => {
    const next = new URLSearchParams(params.toString());

    if (value) next.set(key, value);
    else next.delete(key);

    router.push(`/search?${next.toString()}`);
  };

  // 🔹 옵션 목록은 최초 1번만
  useEffect(() => {
    const fetchOptions = async () => {
      const genreData = await apiFetch("/api/v1/genres");
      const platformData = await apiFetch("/api/v1/platforms");

      setGenres(genreData);
      setPlatforms(platformData);
    };

    fetchOptions();
  }, []);

  return (
    <div className="flex gap-4 justify-center text-xs">
      {/* 장르 */}
      <select
        value={genre}
        onChange={(e) => updateParam("genre", e.target.value)}
        className="h-[26px] px-4 rounded-lg bg-white shadow"
      >
        <option value="">Genre</option>
        {genres.map((g) => (
          <option key={`genre-${g.id}`} value={String(g.id)}>
            {g.name}
          </option>
        ))}
      </select>

      {/* 플랫폼 */}
      <select
        value={platform}
        onChange={(e) => updateParam("platform", e.target.value)}
        className="h-[26px] px-4 rounded-lg bg-white shadow"
      >
        <option value="">Platform</option>
        {platforms.map((p) => (
          <option key={`platform-${p.code}`} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
