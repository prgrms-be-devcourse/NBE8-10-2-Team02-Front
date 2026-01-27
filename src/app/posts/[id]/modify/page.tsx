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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiFetch(`/api/v1/posts/${id}`);
        const data = res?.data || res;
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setTags(data.tags || []);
        }
      } catch (error) {
        alert("게시글을 불러올 수 없습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, router]);

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

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/v1/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, content, tags }),
      });

      if (res) {
        alert("수정되었습니다.");
        router.push(`/posts/${id}`);
        router.refresh();
      }
    } catch (error) {
      alert("수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a1c23] flex items-center justify-center">
        <div className="text-gray-500 font-bold animate-pulse tracking-widest uppercase">
          Loading Post...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20 font-sans">
      {/* 1. 상단 헤더 영역 */}
      <div className="w-full bg-[#111217] py-16 px-6 mb-10 shadow-2xl">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Edit Post
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            기존의 내용을 더 멋지게 다듬어보세요.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-[#252833] rounded-2xl shadow-xl p-8 md:p-12 border border-gray-800"
        >
          {/* 제목 입력 */}
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-[#1a1c23] border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white transition-all text-lg font-bold placeholder:text-gray-600"
              placeholder="제목을 입력하세요"
              maxLength={20}
              required
            />
          </div>

          {/* 태그 영역 */}
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">
              태그
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center border border-blue-500/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 hover:text-white transition-colors"
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
              className="w-full p-4 bg-[#1a1c23] border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-white transition-all text-sm placeholder:text-gray-600"
              placeholder="태그 입력 후 엔터나 쉼표를 누르세요"
            />
          </div>

          {/* 내용 입력 */}
          <div className="mb-10">
            <label className="block text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-5 bg-[#1a1c23] border border-gray-300/10 rounded-xl h-80 focus:border-blue-500 outline-none text-white resize-none transition-all leading-relaxed placeholder:text-gray-600"
              placeholder="내용을 수정하세요..."
              required
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 order-2 md:order-1 bg-transparent text-gray-400 py-4 font-bold rounded-xl hover:bg-gray-800 transition border border-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 order-1 md:order-2 bg-blue-600 text-white py-4 font-black rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 disabled:bg-gray-700 uppercase tracking-widest"
            >
              {submitting ? "Updating..." : "작성 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
