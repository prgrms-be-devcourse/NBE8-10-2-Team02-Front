"use client";

import type { ImportConfirmResponse } from "@/type/importTypes";
import Link from "next/link";

export default function ImportResultsSummary({
  result,
}: {
  result: ImportConfirmResponse;
}) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-green-400">
            {result.totalAdded}
          </p>
          <p className="text-sm text-green-400/70 mt-1">추가됨</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-yellow-400">
            {result.totalSkippedDuplicate}
          </p>
          <p className="text-sm text-yellow-400/70 mt-1">중복 건너뜀</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-red-400">
            {result.totalFailed}
          </p>
          <p className="text-sm text-red-400/70 mt-1">실패</p>
        </div>
      </div>

      {/* Per-game Results */}
      <div className="bg-[#252833] rounded-2xl border border-gray-700 overflow-hidden">
        <div className="max-h-80 overflow-y-auto">
          {result.results.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-5 py-3 border-b border-gray-700/50 last:border-b-0"
            >
              <span className="text-gray-300 text-sm truncate mr-4">
                {item.gameName || `IGDB #${item.igdbId}`}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg shrink-0 ${
                  item.status === "ADDED"
                    ? "bg-green-500/10 text-green-400"
                    : item.status === "DUPLICATE"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {item.status === "ADDED"
                  ? "추가됨"
                  : item.status === "DUPLICATE"
                    ? "중복"
                    : "실패"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="text-center">
        <Link
          href="/library"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95"
        >
          라이브러리로 이동
        </Link>
      </div>
    </div>
  );
}
