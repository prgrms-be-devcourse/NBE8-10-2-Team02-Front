"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImportMatchCandidate, AlternativeMatch } from "@/type/importTypes";
import { PLATFORM_OPTIONS } from "@/type/libraryTypes";

type Selection = {
  igdbId: number;
  platform: string;
};

export default function ImportMatchTable({
  matches,
  selections,
  onSelectionsChange,
}: {
  matches: ImportMatchCandidate[];
  selections: Map<number, Selection>;
  onSelectionsChange: (s: Map<number, Selection>) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggleSelection = (idx: number, candidate: ImportMatchCandidate) => {
    if (!candidate.igdbId) return;
    const next = new Map(selections);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.set(idx, {
        igdbId: candidate.igdbId,
        platform: candidate.suggestedPlatform || "PC",
      });
    }
    onSelectionsChange(next);
  };

  const selectAll = () => {
    const next = new Map<number, Selection>();
    matches.forEach((m, idx) => {
      if (m.igdbId && !m.alreadyInLibrary) {
        next.set(idx, {
          igdbId: m.igdbId,
          platform: m.suggestedPlatform || "PC",
        });
      }
    });
    onSelectionsChange(next);
  };

  const deselectAll = () => {
    onSelectionsChange(new Map());
  };

  const setPlatform = (idx: number, platform: string) => {
    const sel = selections.get(idx);
    if (!sel) return;
    const next = new Map(selections);
    next.set(idx, { ...sel, platform });
    onSelectionsChange(next);
  };

  const pickAlternative = (idx: number, alt: AlternativeMatch) => {
    const next = new Map(selections);
    const existing = selections.get(idx);
    next.set(idx, {
      igdbId: alt.igdbId,
      platform: existing?.platform || "PC",
    });
    onSelectionsChange(next);
    setExpandedIdx(null);
  };

  const selectableCount = matches.filter(
    (m) => m.igdbId && !m.alreadyInLibrary
  ).length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">
          {selections.size}개 선택됨 / {selectableCount}개 선택 가능
        </span>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            전체 선택
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={deselectAll}
            className="text-sm text-gray-400 hover:text-gray-300 font-medium"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#252833] rounded-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_80px_120px_60px] gap-3 px-5 py-3 bg-[#1e2330] text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>원본 이름</span>
          <span>매칭 결과</span>
          <span className="text-center">정확도</span>
          <span className="text-center">플랫폼</span>
          <span className="text-center">선택</span>
        </div>

        {/* Rows */}
        <div className="max-h-[500px] overflow-y-auto">
          {matches.map((match, idx) => {
            const isSelected = selections.has(idx);
            const isDisabled = !match.igdbId || match.alreadyInLibrary;
            const confidencePct = Math.round(match.confidence * 100);
            const coverUrl = match.coverImageId
              ? `https://images.igdb.com/igdb/image/upload/t_thumb/${match.coverImageId}.jpg`
              : null;

            return (
              <div key={idx}>
                <div
                  className={`grid grid-cols-[1fr_1fr_80px_120px_60px] gap-3 px-5 py-3 items-center border-b border-gray-700/50 ${
                    isDisabled
                      ? "opacity-50"
                      : isSelected
                        ? "bg-blue-500/5"
                        : ""
                  }`}
                >
                  {/* Original Name */}
                  <span className="text-gray-300 text-sm truncate">
                    {match.originalName}
                  </span>

                  {/* Matched Result */}
                  <div className="flex items-center gap-2 min-w-0">
                    {match.igdbId ? (
                      <>
                        {coverUrl && (
                          <Image
                            src={coverUrl}
                            alt=""
                            width={32}
                            height={42}
                            className="rounded shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate">
                            {match.matchedName}
                          </p>
                          {match.alternatives.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedIdx(
                                  expandedIdx === idx ? null : idx
                                )
                              }
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              {expandedIdx === idx
                                ? "닫기"
                                : `다른 결과 ${match.alternatives.length}개`}
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        매칭 결과 없음
                      </span>
                    )}
                  </div>

                  {/* Confidence */}
                  <div className="text-center">
                    {match.igdbId ? (
                      <span
                        className={`text-sm font-bold ${
                          confidencePct >= 90
                            ? "text-green-400"
                            : confidencePct >= 70
                              ? "text-yellow-400"
                              : "text-orange-400"
                        }`}
                      >
                        {confidencePct}%
                      </span>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </div>

                  {/* Platform */}
                  <div className="text-center">
                    {match.igdbId && !match.alreadyInLibrary ? (
                      <select
                        value={
                          selections.get(idx)?.platform ||
                          match.suggestedPlatform ||
                          "PC"
                        }
                        onChange={(e) => setPlatform(idx, e.target.value)}
                        className="bg-[#1e2330] text-gray-200 px-2 py-1 rounded-lg border border-gray-600 text-xs w-full"
                      >
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    ) : match.alreadyInLibrary ? (
                      <span className="text-xs text-gray-500">보유 중</span>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </div>

                  {/* Checkbox */}
                  <div className="text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleSelection(idx, match)}
                      className="w-4 h-4 rounded bg-[#1e2330] border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-30"
                    />
                  </div>
                </div>

                {/* Alternatives Dropdown */}
                {expandedIdx === idx && match.alternatives.length > 0 && (
                  <div className="bg-[#1a1d26] px-8 py-3 border-b border-gray-700/50">
                    <p className="text-xs text-gray-500 mb-2">
                      다른 매칭 결과:
                    </p>
                    {match.alternatives.map((alt, altIdx) => (
                      <button
                        key={altIdx}
                        onClick={() => pickAlternative(idx, alt)}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-[#252833] transition-colors text-sm text-gray-300"
                      >
                        {alt.name}{" "}
                        <span className="text-gray-500 text-xs">
                          (IGDB #{alt.igdbId})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
