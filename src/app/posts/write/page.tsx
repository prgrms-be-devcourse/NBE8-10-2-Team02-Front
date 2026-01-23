"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";

export default function PostWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 태그 입력 처리 (쉼표나 엔터로 구분)
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, "");
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 백엔드 PostCreateRequest 구조와 매칭
      const res = await apiFetch("/api/v1/posts", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      });

      if (res.success) {
        alert("게시글이 등록되었습니다.");
        router.push("/posts"); // 리스트로 이동
        router.refresh();
      } else {
        alert(res.msg || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("작성 중 오류 발생:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-20">
      {/* 상단 헤더 영역 */}
      <div className="w-full bg-[#222] py-12 px-6 mb-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white">새 게시글 작성</h1>
          <p className="text-gray-400 mt-2">당신의 이야기를 들려주세요.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-8"
        >
          {/* 제목 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none text-black"
              placeholder="제목을 입력하세요 (최대 20자)"
              maxLength={20}
              required
            />
          </div>

          {/* 태그 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              태그
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full p-3 border border-gray-300 rounded outline-none text-black text-sm"
              placeholder="태그 입력 후 엔터나 쉼표를 누르세요"
            />
          </div>

          {/* 내용 입력 */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded h-64 focus:ring-2 focus:ring-black outline-none text-black resize-none"
              placeholder="내용을 자유롭게 작성하세요..."
              required
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 py-3 font-bold rounded hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 font-bold rounded hover:bg-[#333] transition disabled:bg-gray-400"
            >
              {loading ? "등록 중..." : "게시글 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
