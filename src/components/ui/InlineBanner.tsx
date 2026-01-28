export default function InlineBanner({
  kind,
  message,
}: {
  kind: "error" | "success" | "info";
  message: string;
}) {
  const styles =
    kind === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : kind === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : "border-zinc-700/60 bg-zinc-900/40 text-zinc-200";

  return (
    <div className={`rounded-xl border p-3 text-sm ${styles}`}>
      {message}
    </div>
  );
}
