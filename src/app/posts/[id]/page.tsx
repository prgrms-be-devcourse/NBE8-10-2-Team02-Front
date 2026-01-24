"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

// ✅ 1. CommentItem을 컴포넌트 외부로 분리 (포커스 끊김 방지 핵심)
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
      className={`${isChild ? "bg-gray-50 p-3 mt-2" : "pb-4 border-b border-gray-100"} rounded-lg transition-all`}
    >
      <div className="flex justify-between mb-2">
        <span
          className={`font-bold ${isChild ? "text-sm text-orange-700" : "text-gray-900"}`}
        >
          {isChild && "ㄴ"} {comment.authorName}
        </span>
        <div className="flex gap-2 items-center">
          <span className="text-[11px] text-gray-400">
            {comment.createdDate?.substring(0, 16).replace("T", " ")}
          </span>
          {/* 삭제되지 않은 댓글만 수정/삭제 버튼 노출 */}
          {!comment.deleted && (
            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditContent(comment.content);
                }}
                className="text-blue-500 hover:underline"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 hover:underline ml-1"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            autoFocus // ✅ 수정 창 열리자마자 바로 입력 가능하게
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded text-sm text-black outline-none focus:ring-1 focus:ring-black h-20 resize-none"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => handleUpdateComment(comment.id)}
              className="text-xs bg-black text-white px-3 py-1.5 rounded font-bold"
            >
              저장
            </button>
            <button
              onClick={() => setEditingCommentId(null)}
              className="text-xs bg-gray-400 text-white px-3 py-1.5 rounded font-bold"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-gray-700 whitespace-pre-wrap ${comment.deleted ? "text-gray-400 italic" : ""}`}
        >
          {comment.content}
        </p>
      )}

      {/* 답글 버튼 (부모 댓글이고 삭제 안 됐을 때만) */}
      {!isChild && !comment.deleted && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="text-xs text-gray-500 hover:text-black font-bold border px-2 py-1 rounded"
          >
            {replyingTo === comment.id ? "닫기" : "답글달기"}
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ 2. 메인 페이지 컴포넌트
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

  // 입력/수정 상태
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
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [id]);

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" });
      alert("삭제되었습니다.");
      router.push("/posts");
    } catch (e) {
      alert("삭제 권한이 없습니다.");
    }
  };

  // 댓글/대댓글 등록
  const handleCommentSubmit = async (parentId: number | null = null) => {
    const content = parentId ? replyInput : commentInput;
    if (!content.trim()) return;
    try {
      await apiFetch(`/api/v1/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parentId }),
      });
      parentId ? (setReplyInput(""), setReplyingTo(null)) : setCommentInput("");
      await fetchComments();
    } catch (e) {
      alert("등록 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
        method: "DELETE",
      });
      await fetchComments();
    } catch (e) {
      alert("권한이 없습니다.");
    }
  };

  // 댓글 수정 저장
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await apiFetch(`/api/v1/posts/${id}/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: editContent }),
      });
      setEditingCommentId(null);
      await fetchComments();
    } catch (e) {
      alert("수정 실패");
    }
  };

  if (loading)
    return <div className="p-20 text-center font-bold">로딩 중...</div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-white pb-20 text-black">
      <div className="max-w-4xl mx-auto pt-20 px-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/posts/${id}/modify`)}
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              수정
            </button>
            <button
              onClick={handleDeletePost}
              className="text-sm font-bold text-red-600 hover:underline"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-500 mb-8 pb-4 border-b">
          <span className="font-semibold text-gray-700">
            작성자: {post.authorName}
          </span>
          <span className="text-sm">
            {post.createDate?.replace("T", " ").substring(0, 16)}
          </span>
        </div>

        <div className="text-lg leading-relaxed min-h-[300px] whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="flex gap-2 mt-10">
          {post.tags?.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-sm bg-gray-100 px-3 py-1 rounded text-orange-600 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-20 px-6 pt-10 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-6">댓글</h3>

        {/* 부모 댓글 입력 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-10 border border-gray-200 shadow-sm">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="w-full p-4 border rounded-md h-24 resize-none text-black outline-none focus:ring-1 focus:ring-black"
            placeholder="댓글을 남겨보세요..."
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => handleCommentSubmit(null)}
              className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800 transition"
            >
              등록
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
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

                {/* 대댓글 입력 영역 */}
                {replyingTo === comment.id && (
                  <div className="mt-2 ml-8 p-4 bg-gray-50 rounded-lg border border-blue-100">
                    <textarea
                      autoFocus
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      className="w-full p-3 border rounded-md h-20 resize-none text-black outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="답글을 입력하세요..."
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleCommentSubmit(comment.id)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-700"
                      >
                        답글 등록
                      </button>
                    </div>
                  </div>
                )}

                {/* 대댓글 목록 */}
                <div className="ml-8 space-y-2">
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
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
