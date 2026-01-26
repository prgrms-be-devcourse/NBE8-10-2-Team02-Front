import { GameVideoResponse } from "@/type/gameTypes";

export default function GameTrailer({ video }: { video: GameVideoResponse }) {
  const url = video?.trailerEmbedUrl?.trim() ?? "";
  const hasTrailer = Boolean(url);

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-1">Trailer</h2>
        <span className="text-xs text-text-3">
          {hasTrailer ? "YouTube" : "No trailer"}
        </span>
      </div>

      <div className="mt-4">
        {hasTrailer ? (
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-black">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={url}
                title="Game trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-2 p-6 text-sm text-text-2">
            트레일러가 없어요.
          </div>
        )}
      </div>
    </section>
  );
}
