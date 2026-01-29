"use client";

import { buildIgdbImageUrl, PopularGameCardDto } from "@/type/gameTypes";
import Image from "next/image";
import Link from "next/link";

export default function PopularGamesRail({
  games,
  title = "TOP 10",
}: {
  games: PopularGameCardDto[];
  title?: string;
}) {
  const list = (games ?? []).filter(Boolean);

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-1">{title}</h2>
        <span className="text-xs text-text-3">{list.length} items</span>
      </div>

      {list.length ? (
        <div className="pretty-scrollbar mt-4 -mx-2 overflow-x-auto px-2 pb-2">
          <div className="flex gap-3 snap-x snap-mandatory">
            {list.map((g) => {
              const img =
                buildIgdbImageUrl("t_cover_big", g.coverImageId) ??
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260'%3E%3Crect width='100%25' height='100%25' fill='%23151e27'/%3E%3C/svg%3E";

              return (
                <Link
                  key={g.id}
                  href={`/games/${g.id}`}
                  className="group w-[140px] shrink-0 snap-start"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2">
                    <Image
                      src={img}
                      alt={`${g.name} cover`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="140px"
                      quality={85}
                    />
                  </div>

                  <div className="mt-2">
                    <div className="truncate text-sm font-medium text-text-2 group-hover:text-text-1">
                      {g.name}
                    </div>
                    {g.genres?.[0] && (
                      <div className="mt-0.5 text-xs text-text-3">
                        {g.genres[0]}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[var(--radius-md)] border border-border bg-surface-2 p-6 text-sm text-text-2">
          인기 게임 데이터가 없어요.
        </div>
      )}
    </section>
  );
}
