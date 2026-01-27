"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/backend/client"; // 게시글용
import { getSimilarGames } from "@/lib/backend/gameApi"; // 게임 데이터용 (유사 게임 로직 응용)
import SimilarGamesRail from "@/components/game/SimilarGamesRail";
import { SimilarGameResponse } from "@/type/gameTypes";

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [trendingGames, setTrendingGames] = useState<SimilarGameResponse[]>([]);

  useEffect(() => {
    // 1. 게시글 데이터 로드 (PostController 활용)
    apiFetch("/api/v1/posts?size=6&sort=id,desc").then((res) =>
      setLatestPosts(res.data.content),
    );
    apiFetch("/api/v1/posts?size=6&sort=viewCount,desc").then((res) =>
      setPopularPosts(res.data.content),
    );

    // 2. 트렌딩 게임 로드
    // (임의의 기준 게임 ID를 넣거나, 백엔드에 '인기 게임 전용 API'를 만들어 getSimilarGames 구조로 받으면 됨)
    getSimilarGames(1942)
      .then(setTrendingGames)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      {/* --- 상단: Hero 검색 섹션 --- */}
      <section className="relative h-[500px] flex flex-col items-center justify-center overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="relative z-10 w-full max-w-3xl px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            SEARCH & CONNECT
          </h1>
          <div className="relative group">
            <input
              type="text"
              placeholder="찾으시는 게임이나 게시글 키워드를 입력하세요..."
              className="w-full p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
              ENTER
            </div>
          </div>
        </div>
      </section>

      {/* --- 중앙: 인기 게임 레일 (SimilarGamesRail 컴포넌트 재사용) --- */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            🔥 지금 핫한 게임들
          </h2>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur">
          <SimilarGamesRail games={trendingGames} />
        </div>
      </div>

      {/* --- 하단: 커뮤니티 피드 --- */}
      <div className="max-w-7xl mx-auto py-12 px-6 grid lg:grid-cols-[1fr_350px] gap-12">
        {/* 최신글 피드 */}
        <section>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="h-6 w-1 bg-indigo-500 rounded-full" />
            최신 업데이트 소식
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {latestPosts.map((post: any) => (
              <div
                key={post.id}
                className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-all cursor-pointer"
              >
                <div className="flex gap-2 mb-3">
                  {post.tags?.slice(0, 2).map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <h4 className="font-semibold text-zinc-200 line-clamp-2 group-hover:text-white transition-colors">
                  {post.title}
                </h4>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <span>{post.authorName}</span>
                  <span>{post.createDate.substring(5, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 사이드바: 인기글 순위 */}
        <aside>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="h-6 w-1 bg-emerald-500 rounded-full" />
            주간 인기글
          </h3>
          <div className="space-y-4">
            {popularPosts.map((post: any, i: number) => (
              <div
                key={post.id}
                className="flex gap-4 items-start p-2 group cursor-pointer"
              >
                <span className="text-2xl font-black text-zinc-800 group-hover:text-indigo-500/50 transition-colors">
                  0{i + 1}
                </span>
                <div className="border-b border-zinc-800 pb-3 flex-1">
                  <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                    {post.title}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    조회수 {post.viewCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
