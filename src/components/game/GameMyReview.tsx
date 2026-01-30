"use client";

import { useEffect, useState } from "react";
import { ReviewDto } from "@/type/gameTypes";
import {
  getMyReview,
  writeReview,
  modifyReview,
  deleteReview,
} from "@/lib/backend/reviewApi";
import ReviewCard from "./ReviewCard";

type LoadState = "loading" | "no-review" | "has-review" | "auth-error";

export default function GameMyReview({ gameId, onReviewChange }: { gameId: number; onReviewChange?: () => void }) {
  const [myReview, setMyReview] = useState<ReviewDto | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyReview(gameId)
      .then((review) => {
        setMyReview(review);
        setState("has-review");
      })
      .catch((err) => {
        if (err?.status === 404) {
          // 리뷰 없음 → 작성 가능
          setState("no-review");
        } else {
          // 401/403 등 → 로그인 필요
          setState("auth-error");
        }
      });
  }, [gameId]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const review = await writeReview({ gameId, title, content, rating });
      setMyReview(review);
      setState("has-review");
      setIsWriting(false);
      resetForm();
      onReviewChange?.();
    } catch (e: any) {
      alert(e?.msg || e?.message || "리뷰 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModify = async () => {
    if (!myReview) return;
    setSubmitting(true);
    try {
      const updated = await modifyReview(myReview.id, { title, content, rating });
      setMyReview(updated);
      setIsEditing(false);
      onReviewChange?.();
    } catch (e: any) {
      alert(e?.msg || e?.message || "수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview || !confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      await deleteReview(myReview.id);
      setMyReview(null);
      setState("no-review");
      onReviewChange?.();
    } catch (e: any) {
      alert(e?.msg || e?.message || "삭제에 실패했습니다.");
    }
  };

  const startEdit = () => {
    if (!myReview) return;
    setTitle(myReview.title);
    setContent(myReview.content);
    setRating(myReview.rating);
    setIsEditing(true);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setRating(5);
  };

  // 로그인 안 된 경우
  if (state === "auth-error") {
    return (
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-text-1 mb-3">내 리뷰</h2>
        <p className="text-text-3 text-sm">로그인 후 리뷰를 작성할 수 있습니다.</p>
      </section>
    );
  }

  // 로딩 중
  if (state === "loading") {
    return (
      <section className="card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-24 bg-surface-2 rounded" />
          <div className="h-16 bg-surface-2 rounded" />
        </div>
      </section>
    );
  }

  // 내 리뷰가 있는 경우
  if (state === "has-review" && myReview && !isEditing) {
    return (
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-1">내 리뷰</h2>
          <div className="flex gap-2">
            <button onClick={startEdit} className="btn btn-ghost text-sm">
              수정
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost text-sm text-red-400 hover:text-red-300"
            >
              삭제
            </button>
          </div>
        </div>
        <ReviewCard review={myReview} />
      </section>
    );
  }

  // 리뷰 작성/수정 폼
  if (isWriting || isEditing) {
    return (
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-1">
          {isEditing ? "리뷰 수정" : "리뷰 작성"}
        </h2>

        {/* 별점 */}
        <div>
          <label className="block text-sm text-text-2 mb-1">평점</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                  v <= rating
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-text-3 hover:bg-surface-3"
                }`}
              >
                {v}
              </button>
            ))}
            <span className="ml-2 text-text-2 text-sm font-medium">{rating}/10</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-2 mb-1">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="리뷰 제목"
          />
        </div>

        <div>
          <label className="block text-sm text-text-2 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input h-32 resize-none"
            placeholder="이 게임에 대한 평가를 남겨주세요..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              setIsWriting(false);
              setIsEditing(false);
              resetForm();
            }}
            className="btn btn-secondary text-sm"
          >
            취소
          </button>
          <button
            onClick={isEditing ? handleModify : handleSubmit}
            disabled={submitting}
            className="btn btn-primary text-sm"
          >
            {submitting ? "저장 중..." : isEditing ? "수정 완료" : "등록"}
          </button>
        </div>
      </section>
    );
  }

  // 리뷰 아직 없는 경우 - 작성 버튼
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-1">내 리뷰</h2>
        <button onClick={() => setIsWriting(true)} className="btn btn-primary text-sm">
          리뷰 작성
        </button>
      </div>
    </section>
  );
}
