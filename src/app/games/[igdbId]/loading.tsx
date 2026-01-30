export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-6">
          <div className="h-6 w-56 rounded bg-zinc-800/60" />
          <div className="mt-4 h-4 w-3/4 rounded bg-zinc-800/50" />
          <div className="mt-2 h-4 w-2/3 rounded bg-zinc-800/50" />
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 h-64 rounded-2xl bg-zinc-800/40" />
            <div className="lg:col-span-4 h-64 rounded-2xl bg-zinc-800/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
