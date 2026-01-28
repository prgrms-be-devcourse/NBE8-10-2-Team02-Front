"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";

// 🌈 진한 RGB 네온 스타일 (Glow 효과 포함)
const rgbNeonColors = [
  "bg-red-500/5 text-[#ff4d4d] border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
  "bg-emerald-500/5 text-[#2efc71] border-emerald-500/40 shadow-[0_0_10px_rgba(46,252,113,0.15)]",
  "bg-blue-500/5 text-[#00d4ff] border-blue-500/40 shadow-[0_0_10px_rgba(0,212,255,0.15)]",
  "bg-fuchsia-500/5 text-[#ff00ff] border-fuchsia-500/40 shadow-[0_0_10px_rgba(255,0,255,0.15)]",
  "bg-amber-500/5 text-[#ffcc00] border-amber-500/40 shadow-[0_0_10px_rgba(255,204,0,0.15)]",
];

export default function PostListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
      <PostListContent />
    </Suspense>
  );
}

function PostListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const searchKeyword = searchParams.get("kw") || "";
  const searchTagName = searchParams.get("tag") || "";
  const currentPage = parseInt(searchParams.get("page") || "0");

  const [titleInput, setTitleInput] = useState(searchKeyword);
  const [tagInput, setTagInput] = useState(searchTagName);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.append("kw", searchKeyword);
      if (searchTagName) params.append("tag", searchTagName);
      params.append("page", currentPage.toString());
      params.append("size", "10");

      const res = await apiFetch(`/api/v1/posts?${params.toString()}`);
      if (res && res.data) {
        setPosts(res.data.content || []);
        setPageInfo(res.data);
      }
    } catch (error) {
      console.error("로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (titleInput.trim()) params.set("kw", titleInput.trim());
    if (tagInput.trim()) params.set("tag", tagInput.trim());
    params.set("page", "0");
    router.push(`/posts?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-400 pb-20 font-sans selection:bg-indigo-500/30">
      {/* 1. 상단 바 - 더 얇고 날카로운 다크 디자인 */}
      <div className="w-full bg-black/60 backdrop-blur-xl sticky top-0 z-40 border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto py-5 px-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <input
              className="w-full pl-6 pr-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800 outline-none text-white focus:border-indigo-500/50 transition-all text-sm font-medium"
              placeholder="SEARCH POSTS..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="w-full md:w-40 relative">
            <input
              className="w-full px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800 outline-none text-indigo-400 focus:border-indigo-500/50 transition-all text-sm font-bold tracking-tighter"
              placeholder="# TAG"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleSearch}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-black text-xs transition-all active:scale-95 uppercase"
            >
              SEARCH
            </button>
            <Link
              href="/posts/write"
              className="flex-1 md:flex-none bg-zinc-100 hover:bg-white text-black px-8 py-3 rounded-lg font-black text-xs text-center transition-all uppercase"
            >
              WRITE
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        {/* 필터 바 */}
        {(searchKeyword || searchTagName) && (
          <div className="mb-10 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-sm">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                FILTER APPLIED
              </span>
              <div className="h-3 w-px bg-zinc-700 mx-1" />
              {searchKeyword && (
                <span className="text-xs text-zinc-200 font-bold italic">
                  "{searchKeyword}"
                </span>
              )}
              {searchTagName && (
                <span className="text-xs text-indigo-400 font-bold">
                  #{searchTagName}
                </span>
              )}
              <button
                onClick={() => {
                  setTitleInput("");
                  setTagInput("");
                  router.push("/posts");
                }}
                className="ml-2 text-zinc-500 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 3. 리스트 영역 - 보더로 구분된 그리드 시스템 느낌 */}
        <div className="space-y-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
          {loading ? (
            <div className="bg-[#111114] py-40 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-zinc-600 tracking-[0.2em]">
                SYNCHRONIZING DATA
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-[#111114] py-32 text-center">
              <p className="text-zinc-600 font-bold uppercase tracking-widest">
                No results found.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className="group relative bg-[#111114] hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
              >
                {/* 왼쪽 엣지 강조 */}
                <div className="absolute left-0 inset-y-0 w-[2px] bg-transparent group-hover:bg-indigo-500 transition-all" />

                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
                        Post No.{post.id}
                      </span>
                      <div className="flex gap-2">
                        {post.tags?.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className={`text-[11px] px-2.5 py-1 rounded-sm border font-black uppercase tracking-tighter transition-all group-hover:scale-105 ${rgbNeonColors[idx % rgbNeonColors.length]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors truncate tracking-tight">
                      {post.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      <span className="text-zinc-300">{post.authorName}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <span>{post.createDate?.substring(0, 10)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 md:text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                        Status: Views
                      </span>
                      <span className="text-4xl font-black text-zinc-200 group-hover:text-indigo-400 transition-colors tracking-tighter">
                        {post.viewCount || 0}
                      </span>
                    </div>
                    <div className="text-zinc-800 group-hover:text-zinc-400 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. 페이지네이션 - 사각형 디자인 */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.set("page", i.toString());
                  router.push(`/posts?${p.toString()}`);
                }}
                className={`w-10 h-10 border text-xs font-black transition-all ${
                  currentPage === i
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
