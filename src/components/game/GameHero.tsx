import { buildCoverUrl, GameDetailResponse } from "@/type/gameTypes";
import Image from "next/image";

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
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur">
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 md:grid-cols-[220px_1fr] md:gap-7">
        {/* Cover */}
        <div className="relative">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900">
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
              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                No Cover
              </div>
            )}
          </div>
        </div>

        {/* Title + Summary */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {detail.gameName}
              </h1>
              <span className="rounded-full border border-zinc-700/70 bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-200">
                {formatDate(detail.firstReleaseDate)}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-200/90 sm:text-[15px]">
              {detail.summary?.trim()
                ? detail.summary
                : "요약 정보가 아직 없어요. (IGDB 쪽 데이터가 비어있을 때 종종 그래요)"}
            </p>
          </div>

          {/* quick chips */}
          <div className="flex flex-wrap gap-2">
            {(detail.genres ?? []).slice(0, 6).map((g) => (
              <span
                key={g}
                className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200 ring-1 ring-inset ring-indigo-500/30"
              >
                {g}
              </span>
            ))}
            {(detail.platforms ?? []).slice(0, 4).map((p) => (
              <span
                key={p}
                className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 ring-1 ring-inset ring-emerald-500/30"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
