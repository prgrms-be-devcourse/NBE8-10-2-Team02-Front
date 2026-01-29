"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ReviewDto } from "@/type/gameTypes";
import { getGameReviews } from "@/lib/backend/reviewApi";
import ReviewCard from "./ReviewCard";

export default function GameReviewList({ gameId, refreshKey = 0 }: { gameId: number; refreshKey?: number }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(
    async (pageNum: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await getGameReviews(gameId, pageNum);
        setReviews((prev) => [...prev, ...data.content]);
        setHasMore(!data.last);
        setPage(pageNum);
      } catch {
        // 조회 실패 시 무시
      } finally {
        setLoading(false);
      }
    },
    [gameId, loading],
  );

  // refreshKey 변경 시 리스트 새로고침
  useEffect(() => {
    if (refreshKey > 0 && triggered) {
      setReviews([]);
      setPage(0);
      setHasMore(true);
      fetchReviews(0);
    }
  }, [refreshKey]);

  // Intersection Observer: 섹션이 뷰포트에 보이면 첫 로딩
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          fetchReviews(0);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered, fetchReviews]);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchReviews(page + 1);
    }
  };

  return (
    <section>
      {/* sentinel: 이 요소가 보이면 리뷰 로딩 시작 */}
      <div ref={sentinelRef} />

      {triggered && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-1">
            모든 리뷰
          </h2>

          {reviews.length === 0 && !loading && (
            <p className="text-text-3 text-sm py-4">
              아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
            </p>
          )}

          <div className="divide-y divide-border">
            {reviews.map((review) => (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-text-3 text-sm">리뷰 불러오는 중...</div>
            </div>
          )}

          {!loading && hasMore && reviews.length > 0 && (
            <div className="flex justify-center pt-2">
              <button onClick={loadMore} className="btn btn-secondary text-sm">
                더 보기
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
