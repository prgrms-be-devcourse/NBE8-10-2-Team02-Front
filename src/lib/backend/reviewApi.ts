import { ReviewDto, PageResponse } from "@/type/gameTypes";
import { apiFetch } from "./client";

/** 한 게임의 리뷰 목록 (페이징) - 인증 불필요 */
export async function getGameReviews(gameId: number, page = 0, size = 20) {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const res = await fetch(
    `${BASE}/api/v1/reviews/game/${gameId}?page=${page}&size=${size}`,
    { cache: "no-store", credentials: "include" },
  );
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const json = await res.json();
  return json.data as PageResponse<ReviewDto>;
}

/** 내 리뷰 조회 (게임별) - 없으면 404 throw */
export function getMyReview(gameId: number) {
  return apiFetch<{ data: ReviewDto }>(
    `/api/v1/reviews/my/game/${gameId}`,
  ).then((r) => r.data);
}

/** 리뷰 작성 */
export function writeReview(body: {
  gameId: number;
  title: string;
  content: string;
  rating: number;
}) {
  return apiFetch<{ data: ReviewDto }>(`/api/v1/reviews`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((r) => r.data);
}

/** 리뷰 수정 */
export function modifyReview(
  reviewId: number,
  body: { title: string; content: string; rating: number },
) {
  return apiFetch<{ data: ReviewDto }>(`/api/v1/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  }).then((r) => r.data);
}

/** 리뷰 삭제 */
export function deleteReview(reviewId: number) {
  return apiFetch<void>(`/api/v1/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
