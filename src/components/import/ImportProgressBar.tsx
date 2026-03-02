"use client";

export default function ImportProgressBar({
  processed,
  total,
}: {
  processed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>게임 매칭 중...</span>
      </div>
      <div className="w-full h-3 bg-[#252833] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
