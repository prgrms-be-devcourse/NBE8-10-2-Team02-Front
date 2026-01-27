"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";

const rainbowColors = [
  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  "bg-green-500/10 text-green-400 border border-green-500/20",
  "bg-orange-500/10 text-orange-400 border border-orange-500/20",
];

// useSearchParams를 사용하는 컴포넌트는 Suspense로 감싸는 것이 Next.js 권장사항입니다.
export default function PostListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1c23]" />}>
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

  // URL에서 검색 조건 가져오기
  const searchKeyword = searchParams.get("kw") || ""; // 백엔드와 맞춤 (kw)
  const searchTagName = searchParams.get("tag") || ""; // 백엔드와 맞춤 (tag)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // 입력창 상태 (URL 검색 조건으로 초기화)
  const [titleInput, setTitleInput] = useState(searchKeyword);
  const [tagInput, setTagInput] = useState(searchTagName);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // ✅ 제목(kw)과 태그(tag)를 동시에 쿼리 파라미터로 보냄
      const params = new URLSearchParams();
      if (searchKeyword) params.append("kw", searchKeyword);
      if (searchTagName) params.append("tag", searchTagName);
      params.append("page", currentPage.toString());
      params.append("size", "8");

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

  // ✅ 통합 검색 실행 (제목과 태그 입력을 모두 URL에 반영)
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (titleInput.trim()) params.set("kw", titleInput.trim());
    if (tagInput.trim()) params.set("tag", tagInput.trim());
    params.set("page", "0"); // 검색 시 페이지는 처음으로

    router.push(`/posts?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20 font-sans selection:bg-blue-500/30 tracking-tight">
      {/* 1. 상단 통합 검색 바 섹션 */}
      <div className="w-full bg-[#111217]/80 backdrop-blur-md sticky top-0 z-40 py-8 px-6 border-b border-white/5 shadow-2xl mb-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-5 items-center">
          <div className="relative flex-1 w-full group">
            <input
              className="w-full p-4 pl-6 bg-[#252833] rounded-2xl outline-none text-white border border-gray-700 focus:border-blue-500 transition-all shadow-inner font-medium placeholder:text-gray-500"
              placeholder="게시글 제목으로 찾기..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          {/* 태그 입력창 필드를 상단 바로 통합하면 더 좋습니다 */}
          <div className="relative w-full md:w-48 group">
            <input
              className="w-full p-4 bg-[#252833] rounded-2xl outline-none text-blue-400 border border-gray-700 focus:border-blue-500 transition-all shadow-inner font-bold placeholder:text-gray-600 text-sm"
              placeholder="# 태그 입력"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleSearch}
              className="flex-1 md:flex-none bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95 shadow-lg"
            >
              검색
            </button>
            <Link
              href="/posts/write"
              className="flex-1 md:flex-none bg-white text-black px-10 py-4 rounded-2xl font-bold text-center hover:bg-gray-100 transition-all active:scale-95"
            >
              작성
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* 현재 필터 상태 표시 */}
        {(searchKeyword || searchTagName) && (
          <div className="mb-8 flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Active Filters:
            </span>
            {searchKeyword && (
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-xs border border-gray-700">
                제목: {searchKeyword}
              </span>
            )}
            {searchTagName && (
              <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-lg text-xs border border-blue-500/20">
                #{searchTagName}
              </span>
            )}
            <button
              onClick={() => {
                setTitleInput("");
                setTagInput("");
                router.push("/posts");
              }}
              className="text-xs text-red-400 hover:underline ml-2"
            >
              초기화
            </button>
          </div>
        )}

        {/* 3. 리스트 영역 */}
        <div className="grid gap-5">
          {loading ? (
            <div className="text-center py-40 animate-pulse">
              <p className="font-bold text-gray-500 text-sm italic uppercase tracking-widest">
                Loading Post Feed...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 bg-[#252833] rounded-[2rem] border border-dashed border-gray-700">
              <p className="text-gray-500 font-medium">검색 결과가 없습니다.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className="group bg-[#252833] hover:bg-[#2d313e] transition-all duration-300 rounded-[1.5rem] p-7 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer border border-transparent hover:border-blue-500/30 shadow-sm"
              >
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-400 bg-black/30 px-3 py-1 rounded-full">
                      {post.authorName}
                    </span>
                    <div className="flex gap-2">
                      {post.tags?.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold ${rainbowColors[idx % rainbowColors.length]}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 flex md:flex-col items-end justify-between w-full md:w-auto min-w-[120px]">
                  <div className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-md mb-3">
                    {post.createDate?.substring(0, 10)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                      Views
                    </span>
                    <span className="text-4xl font-black text-white group-hover:text-blue-500 transition-colors tracking-tighter">
                      {post.viewCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. 페이지네이션 */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-20">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.set("page", i.toString());
                  router.push(`/posts?${p.toString()}`);
                }}
                className={`w-11 h-11 rounded-xl font-bold transition-all ${
                  currentPage === i
                    ? "bg-blue-600 text-white"
                    : "bg-[#252833] text-gray-500 hover:text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
