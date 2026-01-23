"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";

export default function PostModifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. 기존 게시글 정보 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiFetch(`/api/v1/posts/${id}`);
        const data = res?.data || res;
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          // 태그 배열을 "태그1, 태그2" 형태의 문자열로 변환
          setTags(data.tags ? data.tags.join(", ") : "");
        }
      } catch (error) {
        alert("게시글을 불러올 수 없습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // 2. 수정 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");

      const res = await apiFetch(`/api/v1/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          content,
          tags: tagList, // 백엔드 DTO 형식에 맞게 전달
        }),
      });

      if (res) {
        alert("수정되었습니다.");
        router.push(`/posts/${id}`); // 수정 후 상세페이지로 이동
        router.refresh(); // 데이터 갱신
      }
    } catch (error) {
      alert("수정에 실패했습니다.");
    }
  };

  if (loading)
    return <div className="p-20 text-center font-bold">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#444] py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-black border-b pb-4">
          게시글 수정
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-md text-black outline-none focus:ring-2 focus:ring-black"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 border rounded-md text-black outline-none focus:ring-2 focus:ring-black"
              placeholder="호러, 공략, 팁..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border rounded-md h-80 resize-none text-black outline-none focus:ring-2 focus:ring-black"
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md font-bold hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 transition"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
