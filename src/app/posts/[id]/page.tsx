"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

// RGB 네온 스타일 정의 (태그 디자인용)
const rgbNeonColors = [
  "bg-red-500/5 text-[#ff4d4d] border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
  "bg-emerald-500/5 text-[#2efc71] border-emerald-500/40 shadow-[0_0_10px_rgba(46,252,113,0.15)]",
  "bg-blue-500/5 text-[#00d4ff] border-blue-500/40 shadow-[0_0_10px_rgba(0,212,255,0.15)]",
  "bg-fuchsia-500/5 text-[#ff00ff] border-fuchsia-500/40 shadow-[0_0_10px_rgba(255,0,255,0.15)]",
];

// --- 댓글 아이템 컴포넌트 (본인 확인 로직 포함) ---
const CommentItem = ({
  comment,
  me, // 로그인한 사용자 정보
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

  // 댓글 작성자와 현재 로그인 유저가 같은지 확인
  const isAuthor = me && comment.authorName === me.nickname;

  return (
    <div
      className={`${
        isChild
          ? "bg-[#0d0e12] border-l-2 border-indigo-500 ml-8"
          : "bg-[#111114]"
      } p-6 rounded-sm mb-4 border border-zinc-800 group transition-all`}
    >
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`font-bold tracking-tight ${isChild ? "text-indigo-400 text-xs" : "text-zinc-50"}`}
          >
            {comment.authorName}
          </span>
          <span className="text-[10px] font-medium text-zinc-500 tracking-wider">
            {comment.createDate?.substring(0, 16).replace("T", " ")}
          </span>
        </div>

        {/* 본인일 때만 수정/삭제 버튼 노출 */}
        {!comment.deleted && isAuthor && (
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
            className="w-full p-4 bg-zinc-900 border border-indigo-500/50 rounded-sm text-sm text-white outline-none h-24 resize-none font-medium leading-relaxed"
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
              className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-sm shadow-lg"
            >
              저장하기
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-[15px] leading-relaxed font-normal ${comment.deleted ? "text-zinc-700 italic" : "text-zinc-200"}`}
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
            className="text-[11px] font-bold text-zinc-500 hover:text-indigo-400 tracking-tight transition-colors"
          >
            {replyingTo === comment.id ? "닫기 ▲" : "답글 쓰기 ▼"}
          </button>
        </div>
      )}
    </div>
  );
};

// --- 메인 상세 페이지 컴포넌트 ---
export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [me, setMe] = useState<any>(null); // 현재 로그인한 사용자 정보
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // 내 정보(프로필) 가져오기
  const fetchMe = async () => {
    try {
      const res = await apiFetch("/api/v1/members/me");
      if (res?.data) setMe(res.data);
    } catch (e) {
      console.log("비로그인 상태 또는 토큰 만료");
    }
  };

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
        // [추가] 페이지 전환 시 스크롤을 맨 위로 강제 이동
        window.scrollTo(0, 0);

        await fetchMe(); // 내 정보 먼저 로드

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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [id]);

  // 게시글 작성자 본인 확인 (닉네임 기준)
  const isPostAuthor = me && post?.authorName === me.nickname;

  const handleLike = async () => {
    try {
      const res = await apiFetch(`/api/v1/posts/${id}/like`, {
        method: "POST",
      });
      if (res.resultCode.startsWith("200"))
        setPost({ ...post, likeCount: res.data });
      else alert(res.msg);
    } catch (e) {
      alert("추천 처리 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
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
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-zinc-600 font-bold animate-pulse tracking-widest text-sm">
          데이터를 불러오는 중...
        </div>
      </div>
    );
  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-40 font-sans antialiased selection:bg-indigo-500/40">
      <div className="max-w-5xl mx-auto pt-24 px-6">
        {/* --- 헤더 --- */}
        <div className="relative mb-16 pb-12 border-b border-zinc-800">
          <div className="absolute -top-10 left-0 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
            Post Archive // No.{post.id}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map((tag: string, i: number) => (
              <span
                key={i}
                className={`text-[10px] px-3 py-1 rounded-sm border font-bold tracking-tight ${rgbNeonColors[i % rgbNeonColors.length]}`}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight flex-1">
              {post.title}
            </h1>

            {/* [수정] 본인일 때만 게시글 수정/삭제 버튼 노출 */}
            {isPostAuthor && (
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/posts/${id}/modify`)}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition border border-zinc-800 px-4 py-2 rounded-sm hover:border-zinc-600"
                >
                  수정
                </button>
                <button
                  onClick={handleDeletePost}
                  className="text-xs font-bold text-zinc-400 hover:text-red-500 transition border border-zinc-800 px-4 py-2 rounded-sm hover:border-red-900/50"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-6 text-[12px] font-bold text-zinc-500 tracking-tight">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">작성자</span>
              <span className="text-zinc-200">{post.authorName}</span>
            </div>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">날짜</span>
              <span className="text-zinc-400 font-medium">
                {post.createDate?.replace("T", " ").substring(0, 16)}
              </span>
            </div>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-600">조회수</span>
              <span className="text-indigo-400">{post.viewCount || 0}</span>
            </div>
          </div>
        </div>

        {/* --- 본문 --- */}
        <div className="text-[17px] leading-[1.8] min-h-[300px] whitespace-pre-wrap mb-24 text-zinc-100 font-normal max-w-4xl tracking-normal">
          {post.content}
        </div>

        {/* --- 추천 UI --- */}
        <div className="flex flex-col items-center py-12 mb-20 border-y border-zinc-800/50 bg-[#0d0e12]/50 relative">
          <button
            onClick={handleLike}
            className="group relative flex flex-col items-center gap-4 active:scale-95 transition-all duration-75"
          >
            <div className="text-[11px] font-bold text-zinc-500 tracking-widest group-hover:text-indigo-400 transition-colors">
              게시글 추천하기
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative z-10 flex items-center gap-6 px-4">
                <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-indigo-500/50" />
                <div className="bg-black border border-zinc-800 px-8 py-4 rounded-sm shadow-xl group-hover:border-indigo-500/50 transition-all">
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums">
                    {post.likeCount || 0}
                  </span>
                </div>
                <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-indigo-500/50" />
              </div>
            </div>
            <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-indigo-600 px-10 py-3 rounded-sm transition-all duration-300">
              <div className="relative z-10 flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-400 group-hover:text-white transition-colors">
                  좋아요
                </span>
                <svg
                  className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors"
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
        <div className="pt-20 border-t border-zinc-800">
          <h3 className="text-sm font-bold mb-10 tracking-widest text-zinc-500 flex items-center gap-4">
            <span>COMMENTS</span>
            <span className="text-indigo-500 text-xl font-black">
              {String(comments.length).padStart(2, "0")}
            </span>
            <div className="flex-1 h-[1px] bg-zinc-900" />
          </h3>

          <div className="bg-[#111114] p-8 rounded-sm mb-16 border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm h-32 resize-none text-zinc-100 outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700 font-medium text-[15px]"
              placeholder="댓글을 입력해 주세요..."
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => handleCommentSubmit(null)}
                className="bg-white text-black px-12 py-4 rounded-sm font-bold hover:bg-indigo-500 hover:text-white transition text-xs tracking-widest active:scale-95 shadow-md"
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
                    me={me} // [추가] 내 정보 전달
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
                    <div className="mt-2 ml-12 p-8 bg-[#0d0e12] rounded-sm border border-indigo-500/30 mb-6 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                      <textarea
                        autoFocus
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-sm h-28 resize-none text-zinc-200 outline-none focus:border-indigo-500/50 transition-all text-[14px]"
                        placeholder="답글 내용을 입력하세요..."
                      />
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleCommentSubmit(comment.id)}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-sm text-xs font-bold hover:bg-indigo-500 transition shadow-lg"
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
                      me={me} // [추가] 내 정보 전달
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
