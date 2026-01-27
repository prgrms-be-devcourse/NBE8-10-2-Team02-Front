"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import Link from "next/link";

// ✅ 태그 색상 (선명한 다크 모드용)
const rainbowColors = [
  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  "bg-green-500/10 text-green-400 border border-green-500/20",
  "bg-orange-500/10 text-orange-400 border border-orange-500/20",
];

export default function PostListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const searchKeyword = searchParams.get("keyword") || "";
  const searchTagName = searchParams.get("tagName") || "";
  const currentPage = parseInt(searchParams.get("page") || "0");

  const [titleInput, setTitleInput] = useState(searchKeyword);
  const [tagInput, setTagInput] = useState(searchTagName);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = "";
      const commonParams = `page=${currentPage}&size=8`;

      if (searchTagName.trim()) {
        url = `/api/v1/posts/tag?tagName=${encodeURIComponent(searchTagName)}&${commonParams}`;
      } else if (searchKeyword.trim()) {
        url = `/api/v1/posts/search?keyword=${encodeURIComponent(searchKeyword)}&${commonParams}`;
      } else {
        url = `/api/v1/posts?${commonParams}`;
      }

      const res = await apiFetch(url);
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

  const handleTitleSearch = () => {
    router.push(`/posts?page=0&keyword=${titleInput}`);
  };

  const handleTagSearch = () => {
    router.push(`/posts?page=0&tagName=${tagInput}`);
  };

  return (
    // font-sans에 시스템 기본 고딕체 스택을 적용하여 Pretendard 느낌을 냄
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20 font-['Pretendard_Variable','Pretendard','-apple-system','BlinkMacSystemFont','system-ui','Roboto','Helvetica_Neue','Segoe_UI','Apple_SD_Gothic_Neo','Noto_Sans_KR','Malgun_Gothic','sans-serif'] selection:bg-blue-500/30 tracking-tight">
      {/* 1. 상단 통합 검색 바 섹션 */}
      <div className="w-full bg-[#111217]/80 backdrop-blur-md sticky top-0 z-40 py-8 px-6 border-b border-white/5 shadow-2xl mb-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-5 items-center">
          <div className="relative flex-1 w-full group">
            <input
              className="w-full p-4 pl-6 bg-[#252833] rounded-2xl outline-none text-white border border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner font-medium placeholder:text-gray-500"
              placeholder="게시글 제목으로 찾기..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSearch()}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleTitleSearch}
              className="flex-1 md:flex-none bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 shadow-lg"
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
        {/* 2. 태그 필터 영역 */}
        <div className="mb-10 inline-flex items-center gap-4 bg-[#252833] p-2 pl-6 pr-4 rounded-2xl border border-white/5 shadow-lg">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
            태그 필터
          </span>
          <div className="h-4 w-[1px] bg-gray-700" />
          <input
            className="bg-transparent outline-none px-2 py-1 text-sm font-semibold text-blue-400 placeholder:text-gray-600 w-32"
            placeholder="태그 입력..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTagSearch()}
          />
        </div>

        {/* 3. 리스트 영역 */}
        <div className="grid gap-5">
          {loading ? (
            <div className="text-center py-40">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-gray-500 text-sm">
                게시글을 불러오는 중입니다...
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
                className="group bg-[#252833] hover:bg-[#2d313e] transition-all duration-300 rounded-[1.5rem] p-7 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer border border-transparent hover:border-blue-500/30 hover:shadow-2xl"
              >
                {/* 좌측: 콘텐츠 */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
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
                          className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold transition-all group-hover:scale-105 ${rainbowColors[idx % rainbowColors.length]}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 우측: 메타 정보 */}
                <div className="mt-6 md:mt-0 flex md:flex-col items-end justify-between w-full md:w-auto min-w-[120px]">
                  <div className="text-[11px] font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-md mb-3">
                    {post.createDate.substring(0, 10)}
                  </div>
                  <div className="flex flex-col items-end leading-none">
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
        {pageInfo && (
          <div className="flex justify-center items-center gap-3 mt-20">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.set("page", i.toString());
                  router.push(`/posts?${p.toString()}`);
                }}
                className={`w-11 h-11 rounded-xl font-bold transition-all active:scale-90 ${
                  currentPage === i
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
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
