import { ReviewDto } from "@/type/gameTypes";

function formatDateTime(dt: string) {
  if (!dt) return "";
  return dt.replace("T", " ").substring(0, 16);
}

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 8
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : rating >= 5
        ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"
        : "text-red-400 border-red-500/40 bg-red-500/10";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-sm font-bold ${color}`}
    >
      {rating}/10
    </span>
  );
}

export default function ReviewCard({ review }: { review: ReviewDto }) {
  return (
    <div className="flex gap-4">
      {/* 왼쪽: 유저 정보 + 평점 (스팀 스타일) */}
      <div className="shrink-0 w-28 flex flex-col items-center gap-2 pt-1">
        {/* 아바타 placeholder */}
        <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-text-3 text-sm font-bold">
          {review.authorNickName.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-text-2 font-medium text-center truncate w-full">
          {review.authorNickName}
        </span>
        <RatingBadge rating={review.rating} />
      </div>

      {/* 오른쪽: 리뷰 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold text-text-1 truncate">
            {review.title}
          </h3>
          <span className="shrink-0 text-xs text-text-3">
            {formatDateTime(review.createDate)}
          </span>
        </div>
        <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap break-words">
          {review.content}
        </p>
      </div>
    </div>
  );
}
