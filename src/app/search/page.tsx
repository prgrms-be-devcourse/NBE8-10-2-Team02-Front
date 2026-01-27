"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useInView } from "react-intersection-observer";
import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";
import SearchHeaderBar from "@/components/search/SearchHeaderBar";
import SearchFilterBar from "@/components/search/SearchFilterBar";

type GameSearchResult = {
  igdbId: number;
  name: string;
  imageUrl: string;
  firstReleaseDate: string;
  genres: string[];
};

export default function SearchDetailPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  // searchParams는 클라이언트 컴포넌트에서 직접 접근하거나
  // 상위 서버 컴포넌트에서 전달받은 값입니다.
  const resolvedParams = use(searchParams);
  const { keyword, platform, genre } = resolvedParams;

  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 바닥 감지용 훅
  const { ref, inView } = useInView({
    threshold: 0.1, // 아주 조금만 보여도 감지
  });

  // 데이터 페칭 함수
  const fetchGames = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (loading || (!hasMore && !isInitial)) return;

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          query: keyword || "",
          page: pageNum.toString(),
          size: "20",
        });
        if (platform) queryParams.set("platform", platform);
        if (genre) queryParams.set("genre", genre);

        const newData = await apiFetch(
          `/api/v1/games/search?${queryParams.toString()}`,
        );

        // 데이터가 20개 미만이면 더 이상 데이터가 없는 것으로 판단
        if (!newData || newData.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setGames((prev) => (isInitial ? newData : [...prev, ...newData]));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    [keyword, platform, genre, loading, hasMore],
  );

  // 1. 키워드/필터 변경 시 데이터 초기화 및 첫 페이지 로드
  useEffect(() => {
    setPage(1);
    fetchGames(1, true);
  }, [keyword, platform, genre]);

  // 2. 스크롤이 바닥에 닿았을 때 다음 페이지 로드
  useEffect(() => {
    if (inView && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchGames(nextPage);
    }
  }, [inView, loading, hasMore, page, fetchGames]);

  return (
    <div className="px-10 py-10 bg-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* 상단 검색바 */}
        <div className="flex justify-center mb-10">
          <SearchHeaderBar initialKeyword={keyword} />
        </div>

        {/* 결과 요약 및 필터 */}
        <div className="flex items-center gap-4 justify-between mb-8">
          <h1 className="text-xl font-bold text-white">
            "{keyword}" 검색 결과
          </h1>
          <SearchFilterBar />
        </div>

        {/* 게임 카드 그리드 */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
          {games.map((game, index) => (
            // 중복 igdbId가 있을 수 있으므로 index를 조합하여 key 생성
            <Link
              key={`${game.igdbId}-${index}`}
              href={`/games/${game.igdbId}`}
              className="block h-full group"
            >
              <li
                className="flex flex-col h-full rounded-xl p-3 bg-white text-black
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)]
                cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full mb-3 overflow-hidden rounded-lg bg-zinc-100">
                  <img
                    src={game.imageUrl || "/images/no-image.png"} // 이미지 없을 때 처리
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-1 px-1">
                  <h2 className="font-bold text-sm mb-2 line-clamp-2 min-h-[40px] leading-tight">
                    {game.name}
                  </h2>

                  <div className="mt-auto pt-2 border-t border-zinc-100 space-y-1">
                    <p className="text-zinc-500 text-[11px]">
                      {game.firstReleaseDate}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {game.genres?.join(", ") || "장르 정보 없음"}
                    </p>
                  </div>
                </div>
              </li>
            </Link>
          ))}
        </ul>

        {/* 바닥 감지 및 로딩 표시 */}
        <div
          ref={ref}
          className="h-40 flex flex-col items-center justify-center mt-10"
        >
          {loading && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-400 text-sm animate-pulse">
                데이터를 불러오는 중...
              </p>
            </div>
          )}
          {!hasMore && games.length > 0 && (
            <p className="text-zinc-500 text-sm bg-zinc-800/50 px-4 py-2 rounded-full">
              모든 결과를 불러왔습니다.
            </p>
          )}
          {!loading && games.length === 0 && (
            <p className="text-zinc-400">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
