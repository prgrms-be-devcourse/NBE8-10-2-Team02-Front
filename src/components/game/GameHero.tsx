import { buildCoverUrl, GameDetailResponse } from "@/type/gameTypes";
import Image from "next/image";
import AddToLibraryButton from "./AddToLibraryButton";

function formatDate(localDate: string | null) {
  if (!localDate) return "TBD";
  // "YYYY-MM-DD" -> 보기좋게
  const [y, m, d] = localDate.split("-").map(Number);
  if (!y || !m || !d) return localDate;
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
}

export default function GameHero({ detail }: { detail: GameDetailResponse }) {
  const coverUrl =
    buildCoverUrl(
      detail.coverUrlTemplate,
      "t_cover_big",
      detail.coverImageId,
    ) ??
    (detail.coverImageId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${detail.coverImageId}.jpg`
      : null);

  return (
    <section className="title-card">
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 md:grid-cols-[220px_1fr] md:gap-7">
        {/* Cover */}
        <div className="relative">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface-2">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={`${detail.gameName} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 70vw, 220px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-text-3">
                No Cover
              </div>
            )}
          </div>
        </div>

        {/* Title + Summary */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight leading-none text-text-1 sm:text-3xl">
                  {detail.gameName}
                </h1>
                <span className="rounded-full border border-border bg-zinc-900/60 px-2 py-0.5 text-xs text-text-2">
                  {formatDate(detail.firstReleaseDate)}
                </span>
              </div>
              <AddToLibraryButton gameId={detail.gameId} />
            </div>

            <p className="mt-3 text-sm leading-6 text-text-2 sm:text-[15px]">
              {detail.summary?.trim()
                ? detail.summary
                : "요약 정보가 아직 없슈.."}
            </p>
          </div>

          {/* quick chips */}
          <div className="flex flex-wrap gap-2">
            {(detail.genres ?? []).slice(0, 6).map((g) => (
              <span key={g} className="span-genre">
                {g}
              </span>
            ))}
            {(detail.platforms ?? []).slice(0, 4).map((p) => (
              <span key={p} className="span-platform">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
