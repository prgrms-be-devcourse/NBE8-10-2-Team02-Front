"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // useRouter 추가
import Link from "next/link"; // Link 추가
import { apiFetch } from "@/lib/backend/client";
import { getIgdbPopularGames } from "@/lib/backend/gameApi";
import PopularGamesRail from "@/components/game/PopularGamesRail";
import { PopularGameCardDto } from "@/type/gameTypes";
import TypingTitle from "@/components/main/TypingTitle";
import { useGameSearch } from "@/hooks/useGameSearch";

export default function HomePage() {
  const router = useRouter(); // 라우터 초기화
  const [latestPosts, setLatestPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [igdbPopularGames, setIgdbPopularGames] = useState<
    PopularGameCardDto[]
  >([]);

  // 검색 관련 상태 및 훅
  const [keyword, setKeyword] = useState("");
  const { search } = useGameSearch();

  useEffect(() => {
    // 1. 게시글 데이터 로드
    apiFetch("/api/v1/posts?size=6&sort=id,desc").then((res) =>
      setLatestPosts(res.data.content),
    );
    apiFetch("/api/v1/posts?size=6&sort=viewCount,desc").then((res) =>
      setPopularPosts(res.data.content),
    );

    // 2. IGDB 인기 게임 로드
    getIgdbPopularGames(10)
      .then(setIgdbPopularGames)
      .catch(() => {});
  }, []);

  // 검색 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search(keyword)) {
      alert("검색어를 입력해주세요!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      {/* --- 상단: Hero 검색 섹션 --- */}
      <section className="relative h-[550px] flex flex-col items-center justify-center overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />

        <div className="relative z-10 w-full max-w-3xl px-6 text-center">
          <div className="mb-6">
            <TypingTitle />
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="찾으시는 게임이나 게시글 키워드를 입력하세요..."
              className="w-full p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg pr-20"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
            >
              ENTER
            </button>
          </form>
        </div>
      </section>

      {/* --- 중앙: 인기 게임 레일 --- */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            🔥 지금 핫한 게임들
          </h2>
        </div>
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur">
          <PopularGamesRail games={igdbPopularGames} title="TOP 10" />
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
              <Link
                key={post.id}
                href={`/posts/${post.id}`} // 게시글 상세로 이동
                className="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-all cursor-pointer block"
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
                  <span>{post.createDate?.substring(5, 10)}</span>
                </div>
              </Link>
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
              <Link
                key={post.id}
                href={`/posts/${post.id}`} // 게시글 상세로 이동
                className="flex gap-4 items-start p-2 group cursor-pointer block"
              >
                <div className="flex gap-4 items-start w-full">
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
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
