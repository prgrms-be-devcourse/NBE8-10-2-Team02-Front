"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

// RGB 네온 스타일 (태그 색상)
const rgbNeonColors = [
  "bg-red-500/10 text-[#ff4d4d] border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
  "bg-emerald-500/10 text-[#2efc71] border-emerald-500/50 shadow-[0_0_12px_rgba(46,252,113,0.2)]",
  "bg-blue-500/10 text-[#00d4ff] border-blue-500/50 shadow-[0_0_12px_rgba(0,212,255,0.2)]",
  "bg-fuchsia-500/10 text-[#ff00ff] border-fuchsia-500/50 shadow-[0_0_12px_rgba(255,0,255,0.2)]",
];

// --- 댓글 아이템 컴포넌트 ---
const CommentItem = ({
  comment,
  isChild = false,
  editingCommentId,
  editContent,
  setEditingCommentId,
  setEditContent,
  handleUpdateComment,
  handleDeleteComment,
  replyingTo,
  setReplyingTo,
}: any) => {
  const isEditing = editingCommentId === comment.id;

  return (
    <div
      className={`${
        isChild
          ? "bg-[#0d0e12] border-l-2 border-indigo-500 ml-8"
          : "bg-[#16171d]"
      } p-6 rounded-sm mb-4 border border-zinc-800 group transition-all`}
    >
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`font-black tracking-tight ${isChild ? "text-indigo-400 text-xs" : "text-zinc-50"}`}
          >
            {comment.authorName}
          </span>
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest">
            {comment.createDate?.substring(0, 16).replace("T", " ")}
          </span>
        </div>
        {!comment.deleted && (
          <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setEditingCommentId(comment.id);
                setEditContent(comment.content);
              }}
              className="text-[11px] font-bold text-zinc-400 hover:text-indigo-400"
            >
              수정
            </button>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-[11px] font-bold text-zinc-400 hover:text-red-500"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-indigo-500/50 rounded-sm text-sm text-white outline-none h-24 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingCommentId(null)}
              className="text-xs font-bold bg-zinc-800 text-zinc-400 px-4 py-2 rounded-sm"
            >
              취소
            </button>
            <button
              onClick={() => handleUpdateComment(comment.id)}
              className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-sm"
            >
              저장하기
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-[15px] leading-relaxed font-medium ${comment.deleted ? "text-zinc-700 italic" : "text-zinc-100"}`}
        >
          {comment.content}
        </p>
      )}

      {!isChild && !comment.deleted && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="text-[10px] font-bold text-zinc-500 hover:text-indigo-400 tracking-tighter"
          >
            {replyingTo === comment.id ? "답글 닫기 ▲" : "답글 쓰기 ▼"}
          </button>
        </div>
      )}
    </div>
  );
};

// --- 메인 페이지 컴포넌트 ---
export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = async () => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/comments`);
      const data = res?.data || res;
      if (Array.isArray(data)) setComments(data);
    } catch (e) {
      console.error("댓글 로딩 실패", e);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const postRes = await apiFetch(`/api/v1/posts/${id}`);
        const postData = postRes?.data || postRes;
        if (postData && postData.id) {
          setPost(postData);
          await fetchComments();
        } else {
          router.push("/posts");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [id, router]);

  // 추천(좋아요) 처리
  const handleLike = async () => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/like`, {
        method: "POST",
      });
      if (res.resultCode?.startsWith("200")) {
        setPost({ ...post, likeCount: res.data });
      } else {
        alert(res.msg || "이미 추천했거나 오류가 발생했습니다.");
      }
    } catch (e) {
      alert("추천 처리 중 오류가 발생했습니다.");
    }
  };

  // 댓글 & 답글 등록
  const handleCommentSubmit = async (parentId: number | null) => {
    const content = parentId ? replyInput : commentInput;
    if (!content.trim()) return alert("내용을 입력해주세요.");

    try {
      const res = await apiFetch(`/api/v1/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentId }),
      });
      if (res.resultCode?.startsWith("200")) {
        parentId ? setReplyInput("") : setCommentInput("");
        setReplyingTo(null);
        await fetchComments();
      }
    } catch (e) {
      alert("등록 실패");
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId: number) => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: editContent }),
      });
      if (res.resultCode?.startsWith("200")) {
        setEditingCommentId(null);
        await fetchComments();
      }
    } catch (e) {
      alert("수정 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.resultCode?.startsWith("200")) await fetchComments();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-zinc-500 font-black animate-pulse text-sm tracking-widest">
          LOADING DATA...
        </div>
      </div>
    );
  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-40 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto pt-24 px-6">
        {/* --- 헤더 --- */}
        <div className="relative mb-16 pb-12 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-sm tracking-widest uppercase">
              Post No.{post.id}
            </span>
            <div className="flex gap-2">
              {post.tags?.map((tag: string, i: number) => (
                <span
                  key={i}
                  className={`text-[10px] px-2.5 py-0.5 rounded-sm border font-black tracking-tighter ${rgbNeonColors[i % rgbNeonColors.length]}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight flex-1">
              {post.title}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/posts/${id}/modify`)}
                className="text-xs font-bold text-zinc-400 hover:text-white border border-zinc-800 px-5 py-2.5 rounded-sm transition-all hover:bg-zinc-900"
              >
                수정
              </button>
              <button
                onClick={() => {
                  if (confirm("게시글을 삭제하시겠습니까?"))
                    apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" }).then(
                      () => router.push("/posts"),
                    );
                }}
                className="text-xs font-bold text-zinc-400 hover:text-red-500 border border-zinc-800 px-5 py-2.5 rounded-sm transition-all hover:bg-red-950/20 hover:border-red-900/50"
              >
                삭제
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs font-bold text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 uppercase">Writer</span>
              <span className="text-zinc-100">{post.authorName}</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 uppercase">Date</span>
              <span className="text-zinc-300">
                {post.createDate?.replace("T", " ").substring(0, 16)}
              </span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 uppercase">Views</span>
              <span className="text-indigo-400">{post.viewCount || 0}</span>
            </div>
          </div>
        </div>

        {/* --- 본문 --- */}
        <div className="bg-zinc-900/40 p-8 md:p-12 rounded-sm border border-zinc-800/60 mb-20 shadow-2xl">
          <div className="text-[17px] md:text-[19px] leading-[1.8] whitespace-pre-wrap text-zinc-50 font-medium">
            {post.content}
          </div>
        </div>

        {/* --- 추천 UI (컴팩트 & 한글 버전) --- */}
        <div className="flex flex-col items-center py-12 mb-20 border-y border-zinc-800/50 bg-[#0d0e12]/50 relative">
          {/* 배경 은은한 광원 (더 작게 조정) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-600/10 blur-[80px] pointer-events-none" />

          <button
            onClick={handleLike}
            className="group relative flex flex-col items-center gap-4 active:scale-95 transition-all duration-75"
          >
            {/* 상단 라벨 */}
            <div className="text-[10px] font-black text-zinc-600 tracking-[0.3em] group-hover:text-indigo-400 transition-colors uppercase">
              게시글 추천하기
            </div>

            <div className="relative flex items-center justify-center">
              {/* 클릭 시 파동 효과 */}
              <div className="absolute inset-0 rounded-sm bg-indigo-500/40 animate-ping opacity-0 group-active:opacity-100" />

              {/* 메인 숫자 전광판 (크기 축소) */}
              <div className="relative z-10 flex items-center gap-6 px-4">
                <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-indigo-500/50 transition-colors" />

                <div className="bg-black border border-zinc-800 px-8 py-4 rounded-sm shadow-xl group-hover:border-indigo-500 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all duration-300">
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
                    {post.likeCount || 0}
                  </span>
                </div>

                <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-indigo-500/50 transition-colors" />
              </div>
            </div>

            {/* 하단 클릭 버튼 (너비 조정) */}
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-indigo-600 px-8 py-3 rounded-sm transition-all duration-300 shadow-lg">
              {/* 차오르는 배경 */}
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

              <div className="relative z-10 flex items-center gap-2">
                <span className="font-black text-xs tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                  좋아요
                </span>
                <svg
                  className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* --- 댓글 섹션 --- */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Comments
            </h3>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-0.5 rounded-sm text-sm border border-indigo-500/20">
              {comments.length}
            </span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <div className="bg-[#111114] p-8 rounded-sm mb-16 border border-zinc-800">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full p-6 bg-zinc-900 border border-zinc-800 rounded-sm h-32 resize-none text-white outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600 font-medium"
              placeholder="따뜻한 댓글 한마디 부탁드려요..."
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleCommentSubmit(null)}
                className="bg-white text-black px-10 py-4 rounded-sm font-black hover:bg-indigo-500 hover:text-white transition-all text-xs tracking-widest uppercase shadow-lg"
              >
                댓글 등록
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {comments
              .filter((c: any) => !c.parentId)
              .map((comment: any) => (
                <div key={comment.id}>
                  <CommentItem
                    comment={comment}
                    editingCommentId={editingCommentId}
                    editContent={editContent}
                    setEditingCommentId={setEditingCommentId}
                    setEditContent={setEditContent}
                    handleUpdateComment={handleUpdateComment}
                    handleDeleteComment={handleDeleteComment}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                  />

                  {replyingTo === comment.id && (
                    <div className="mt-2 ml-12 p-6 bg-[#0d0e12] rounded-sm border border-indigo-500/40 mb-6 animate-in fade-in slide-in-from-top-2">
                      <textarea
                        autoFocus
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-sm h-28 resize-none text-white outline-none focus:border-indigo-400 transition-all text-sm"
                        placeholder="답글을 작성하세요..."
                      />
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleCommentSubmit(comment.id)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-sm text-[10px] font-black hover:bg-indigo-500 uppercase"
                        >
                          답글 등록
                        </button>
                      </div>
                    </div>
                  )}

                  {comment.children?.map((child: any) => (
                    <CommentItem
                      key={child.id}
                      comment={child}
                      isChild={true}
                      editingCommentId={editingCommentId}
                      editContent={editContent}
                      setEditingCommentId={setEditingCommentId}
                      setEditContent={setEditContent}
                      handleUpdateComment={handleUpdateComment}
                      handleDeleteComment={handleDeleteComment}
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
