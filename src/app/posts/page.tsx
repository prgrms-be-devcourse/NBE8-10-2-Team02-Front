"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";

// ✅ 1. 무지개 색상 배열 정의 (부드러운 파스텔톤 클래스)
const rainbowColors = [
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
];

interface PostListItem {
  id: number;
  title: string;
  authorId: number;
  authorName: string;
  content: string;
  createDate: string;
  modifyDate: string;
  tags: string[];
  viewCount?: number;
}

interface PageResponse {
  content: PostListItem[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function PostListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 현재 상태 추출
  const searchKeyword = searchParams.get("keyword") || "";
  const searchTagName = searchParams.get("tagName") || "";
  const currentPage = parseInt(searchParams.get("page") || "0");

  const [titleInput, setTitleInput] = useState(searchKeyword);
  const [tagInput, setTagInput] = useState(searchTagName);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = "";
      const commonParams = `page=${currentPage}&size=10`;

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
      console.error("게시글 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  const handleTitleSearch = () => {
    setTagInput("");
    router.push(`/posts?page=0&keyword=${titleInput}`);
  };

  const handleTagSearch = () => {
    setTitleInput("");
    router.push(`/posts?page=0&tagName=${tagInput}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/posts?${params.toString()}`);
  };

  // ✅ 게시글 삭제 핸들러
  const handleDeletePost = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation(); // 상세 페이지 이동 방지
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      await apiFetch(`/api/v1/posts/${postId}`, { method: "DELETE" });
      alert("삭제되었습니다.");
      fetchPosts(); // 목록 새로고침
    } catch (error) {
      alert("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#444] pb-20 font-sans">
      {/* 이미지 UI를 반영한 헤더 영역 */}
      <div className="w-full bg-[#333] pt-10 pb-10 px-6 mb-4 shadow-xl">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* 1. 제목 검색창 */}
          <div className="flex gap-2">
            <input
              className="flex-1 p-3 bg-white outline-none text-black font-medium"
              placeholder="게시글 제목을 입력하세요"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSearch()}
            />
            <button
              onClick={handleTitleSearch}
              className="bg-[#222] text-white px-8 py-3 font-bold hover:bg-black transition uppercase border border-[#555]"
            >
              search
            </button>
            <button
              onClick={() => router.push("/posts/write")}
              className="bg-[#222] text-white px-8 py-3 font-bold hover:bg-black transition border border-[#555]"
            >
              글 작성
            </button>
          </div>

          {/* 2. 태그 검색창 */}
          <div className="flex items-center gap-2">
            <span className="bg-[#222] text-white px-6 py-2.5 font-bold border border-[#555]">
              태그
            </span>
            <input
              className="w-1/4 p-2.5 bg-white outline-none text-black text-sm"
              placeholder="호러, 공략..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTagSearch()}
            />
          </div>
        </div>
      </div>

      {/* 리스트 본문 영역 */}
      <div className="max-w-4xl mx-auto px-6 bg-[#666] p-6 rounded-lg shadow-inner">
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-black text-gray-300 border-b border-gray-500 mb-4 uppercase tracking-widest">
          <div className="col-span-6 text-center">제목</div>
          <div className="col-span-2 text-center">작성자</div>
          <div className="col-span-2 text-center">작성일</div>
          <div className="col-span-2 text-center">조회수</div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-white font-bold animate-pulse">
              Loading...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white p-10 text-center rounded text-gray-400 font-bold">
              검색 결과가 없습니다.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className="group relative bg-white rounded shadow-md p-4 grid grid-cols-12 items-center cursor-pointer hover:bg-gray-100 transition duration-200"
              >
                <div className="col-span-6 px-4">
                  <div className="font-bold text-gray-800 text-base mb-2 flex items-center gap-2">
                    {post.title}
                    {/* 호버 시 나타나는 제어 버튼 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/posts/${post.id}/modify`);
                        }}
                        className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => handleDeletePost(e, post.id)}
                        className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {/* ✅ 무지개 색상 태그 적용 부분 */}
                    {post.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded font-black shadow-sm ${
                          rainbowColors[idx % rainbowColors.length]
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm text-gray-700 font-bold truncate px-2">
                  {post.authorName}
                </div>
                <div className="col-span-2 text-center text-sm text-gray-500 font-medium">
                  {post.createDate ? post.createDate.substring(0, 10) : "-"}
                </div>
                <div className="col-span-2 text-center font-black text-gray-800">
                  {post.viewCount || 0}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {pageInfo && pageInfo.totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`w-8 h-8 flex items-center justify-center text-sm transition-all ${
                  currentPage === i
                    ? "bg-white text-black font-black scale-110 shadow-lg"
                    : "text-white hover:text-gray-300 font-bold"
                }`}
              >
                {i + 1}
              </button>
            ))}
            {currentPage < pageInfo.totalPages - 1 && (
              <button
                onClick={() => goToPage(currentPage + 1)}
                className="text-white ml-2 hover:translate-x-1 transition-transform font-black"
              >
                &gt;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
