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
        alert("데이터를 동기화할 수 없습니다.");
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
        alert("수정 완료: 데이터가 성공적으로 갱신되었습니다.");
        router.push(`/posts/${id}`);
        router.refresh();
      }
    } catch (error) {
      alert("데이터 갱신에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-zinc-500 font-black animate-pulse text-sm tracking-[0.3em] uppercase">
          Syncing Data...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 font-sans selection:bg-indigo-500/30">
      {/* 1. 상단 헤더 영역 - 수정 모드 강조 */}
      <div className="w-full bg-[#0d0e12] py-20 px-6 mb-12 border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <span className="text-[10px] font-black text-indigo-500 tracking-[0.5em] uppercase mb-4 block">
            System Override
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
            Edit <span className="text-indigo-600">Archive</span>
          </h1>
          <p className="text-zinc-500 mt-6 font-bold text-sm tracking-tight border-l-2 border-zinc-800 pl-4 uppercase">
            기존 게시글을 수정합니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* 제목 입력 영역 */}
          <div className="group">
            <label className="block text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-[0.2em] group-focus-within:text-indigo-500 transition-colors">
              Post Subject / 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900/40 border-b-2 border-zinc-800 p-0 pb-4 focus:border-indigo-500 outline-none text-white transition-all text-3xl md:text-4xl font-black placeholder:text-zinc-800"
              placeholder="제목을 입력하세요"
              maxLength={40}
              required
            />
          </div>

          {/* 태그 영역 */}
          <div>
            <label className="block text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-[0.2em]">
              Tags / 태그 수정
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-sm text-xs font-black flex items-center border border-indigo-500/30 shadow-[0_0_10px_rgba(79,70,229,0.1)]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 hover:text-white text-indigo-700 transition-colors"
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
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm focus:border-indigo-500/50 outline-none text-white transition-all text-sm font-bold placeholder:text-zinc-700"
              placeholder="태그 입력 (엔터 또는 쉼표)"
            />
          </div>

          {/* 내용 입력 영역 */}
          <div>
            <label className="block text-[10px] font-black text-zinc-500 mb-4 uppercase tracking-[0.2em]">
              Content / 데이터 본문
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-6 bg-zinc-900/30 border border-zinc-800 rounded-sm h-[450px] focus:border-indigo-500/50 outline-none text-zinc-100 resize-none transition-all text-lg leading-relaxed placeholder:text-zinc-800"
              placeholder="수정할 내용을 입력하십시오..."
              required
            />
          </div>

          {/* 하단 컨트롤 영역 */}
          <div className="flex items-center justify-between pt-10 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs font-black text-zinc-600 hover:text-white transition-colors tracking-widest uppercase"
            >
              Cancel / 돌아가기
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="group relative px-12 py-4 bg-white text-black font-black rounded-sm hover:bg-indigo-600 hover:text-white transition-all disabled:bg-zinc-800 disabled:text-zinc-500 overflow-hidden"
            >
              <span className="relative z-10 tracking-[0.2em] uppercase text-sm">
                {submitting ? "Updating..." : "Update Archive"}
              </span>
              <div className="absolute inset-0 bg-indigo-600 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
