"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

// ✅ 1. 댓글 아이템 컴포넌트
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
          ? "bg-[#1a1c23] border-l-2 border-blue-500 ml-6"
          : "bg-[#252833]"
      } p-5 rounded-xl transition-all mb-3 border border-gray-800`}
    >
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`font-black ${isChild ? "text-blue-400 text-sm" : "text-white"}`}
          >
            {comment.authorName}
          </span>
          <span className="text-[10px] text-gray-500">
            {comment.createDate?.substring(0, 16).replace("T", " ")}
          </span>
        </div>
        {!comment.deleted && (
          <div className="flex gap-3 text-[11px] font-bold">
            <button
              onClick={() => {
                setEditingCommentId(comment.id);
                setEditContent(comment.content);
              }}
              className="text-gray-400 hover:text-blue-400"
            >
              수정
            </button>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-gray-400 hover:text-red-400"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-4 bg-[#1a1c23] border border-blue-500 rounded-lg text-sm text-white outline-none h-24 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => handleUpdateComment(comment.id)}
              className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              저장
            </button>
            <button
              onClick={() => setEditingCommentId(null)}
              className="text-xs bg-gray-700 text-white px-4 py-2 rounded-lg font-bold"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-sm leading-relaxed ${comment.deleted ? "text-gray-600 italic" : "text-gray-300"}`}
        >
          {comment.content}
        </p>
      )}

      {!isChild && !comment.deleted && (
        <div className="flex justify-end mt-3">
          <button
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="text-[10px] text-gray-500 hover:text-blue-400 font-black uppercase tracking-widest"
          >
            {replyingTo === comment.id ? "[ 답글 닫기 ]" : "[ 답글 작성 ]"}
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ 2. 메인 상세 페이지 컴포넌트
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
    const res = await apiFetch(`/api/v1/posts/${id}/comments`);
    const data = res?.data || res;
    if (Array.isArray(data)) setComments(data);
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
        } else {
          router.push("/posts");
          return;
        }
        await fetchComments();
      } catch (error) {
        console.error("로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/like`, {
        method: "POST",
      });
      if (res.resultCode.startsWith("200")) {
        setPost({ ...post, likeCount: res.data });
      } else {
        alert(res.msg || "로그인이 필요합니다.");
      }
    } catch (e) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    await apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" });
    router.push("/posts");
  };

  const handleCommentSubmit = async (parentId: number | null = null) => {
    const content = parentId ? replyInput : commentInput;
    if (!content.trim()) return;
    await apiFetch(`/api/v1/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId }),
    });
    parentId ? (setReplyInput(""), setReplyingTo(null)) : setCommentInput("");
    await fetchComments();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
      method: "DELETE",
    });
    await fetchComments();
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    await apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content: editContent }),
    });
    setEditingCommentId(null);
    await fetchComments();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a1c23] flex items-center justify-center">
        <div className="text-gray-500 font-bold animate-pulse tracking-widest">
          LOADING CONTENT...
        </div>
      </div>
    );
  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20 font-sans">
      <div className="max-w-4xl mx-auto pt-20 px-6">
        {/* --- 헤더 --- */}
        <div className="flex justify-between items-end mb-8 pb-8 border-b border-gray-800">
          <div className="space-y-4 flex-1">
            <div className="flex gap-2">
              {post.tags?.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
              <span className="text-gray-300">By {post.authorName}</span>
              <span>•</span>
              <span>{post.createDate?.replace("T", " ").substring(0, 16)}</span>
              <span>•</span>
              <span>조회 {post.viewCount || 0}</span>
            </div>
          </div>
          <div className="flex gap-3 mb-1">
            <button
              onClick={() => router.push(`/posts/${id}/modify`)}
              className="text-xs font-bold text-gray-500 hover:text-white transition"
            >
              수정
            </button>
            <button
              onClick={handleDeletePost}
              className="text-xs font-bold text-gray-500 hover:text-red-500 transition"
            >
              삭제
            </button>
          </div>
        </div>

        {/* --- 본문 --- */}
        <div className="text-lg leading-relaxed min-h-[400px] whitespace-pre-wrap mb-20 text-gray-300">
          {post.content}
        </div>

        {/* --- 좋아요 버튼 --- */}
        <div className="flex flex-col items-center justify-center py-10 mb-20 bg-[#252833] rounded-3xl border border-gray-800 shadow-xl">
          <button
            onClick={handleLike}
            className="group flex items-center justify-center w-20 h-20 bg-red-500/10 border-2 border-red-500/20 rounded-full hover:bg-red-500/20 hover:border-red-500 transition-all active:scale-90 mb-4"
          >
            <span className="text-3xl group-hover:scale-125 transition-transform">
              ❤️
            </span>
          </button>
          <span className="font-black text-2xl text-white tracking-tighter">
            {post.likeCount || 0}{" "}
            <span className="text-gray-500 text-sm font-normal ml-1">
              좋아요
            </span>
          </span>
        </div>

        {/* --- 댓글 섹션 --- */}
        <div className="pt-10 border-t border-gray-800">
          <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-white">
            댓글 목록{" "}
            <span className="text-blue-500 ml-2">{comments.length}</span>
          </h3>

          <div className="bg-[#252833] p-6 rounded-2xl mb-12 border border-gray-800 shadow-lg">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full p-5 bg-[#1a1c23] border border-gray-700 rounded-xl h-28 resize-none text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              placeholder="게이머와 소통해보세요..."
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleCommentSubmit(null)}
                className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black hover:bg-blue-700 transition uppercase text-sm tracking-widest shadow-lg shadow-blue-900/20"
              >
                댓글 작성
              </button>
            </div>
          </div>

          <div className="space-y-4">
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

                  {/* 답글 입력창 */}
                  {replyingTo === comment.id && (
                    <div className="mt-2 ml-10 p-5 bg-[#252833] rounded-xl border border-blue-500/30 mb-4">
                      <textarea
                        autoFocus
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        className="w-full p-4 bg-[#1a1c23] border border-gray-700 rounded-lg h-24 resize-none text-white outline-none focus:border-blue-500 transition-all text-sm"
                        placeholder="답글 내용을 입력하세요..."
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleCommentSubmit(comment.id)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-black hover:bg-blue-700 transition uppercase tracking-widest"
                        >
                          Submit Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 대댓글 리스트 */}
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
