import { GameDetailResponse } from "@/type/gameTypes";

function MetaRow({ label, items }: { label: string; items: string[] }) {
  const list = (items ?? []).filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-text-3">{label}</div>

      {list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((x) => (
            <span
              key={x}
              className="rounded-[var(--radius-sm)] border border-border bg-surface-2 px-2 py-1 text-xs text-text-2"
            >
              {x}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-sm text-text-3">-</div>
      )}
    </div>
  );
}

export default function GameMeta({ detail }: { detail: GameDetailResponse }) {
  return (
    <aside className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-text-1">Game Info</div>
        <button className="btn btn-ghost text-xs px-3 py-1">Share</button>
      </div>

      <div className="mt-4 space-y-4">
        <MetaRow label="Developers" items={detail.developers} />
        <MetaRow label="Publishers" items={detail.publishers} />
        <MetaRow label="Genres" items={detail.genres} />
        <MetaRow label="Platforms" items={detail.platforms} />
      </div>
    </aside>
  );
}
