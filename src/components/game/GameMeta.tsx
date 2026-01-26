// src/components/game/GameMeta.tsx

import { GameDetailResponse } from "@/type/gameTypes";

function MetaRow({ label, items }: { label: string; items: string[] }) {
  const list = (items ?? []).filter(Boolean);
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      {list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((x) => (
            <span
              key={x}
              className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-2 py-1 text-xs text-zinc-200"
            >
              {x}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-sm text-zinc-500">-</div>
      )}
    </div>
  );
}

export default function GameMeta({ detail }: { detail: GameDetailResponse }) {
  return (
    <aside className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4 backdrop-blur sm:p-5">
      <div className="text-sm font-semibold">Game Info</div>
      <div className="mt-4 space-y-4">
        <MetaRow label="Developers" items={detail.developers} />
        <MetaRow label="Publishers" items={detail.publishers} />
        <MetaRow label="Genres" items={detail.genres} />
        <MetaRow label="Platforms" items={detail.platforms} />
      </div>
    </aside>
  );
}
