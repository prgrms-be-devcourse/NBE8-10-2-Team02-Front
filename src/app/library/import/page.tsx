"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getMe, type MeResponse } from "@/lib/backend/me";
import {
  startImportMatch,
  pollImportJob,
  confirmImport,
} from "@/lib/backend/importApi";
import type {
  ImportMatchCandidate,
  ImportConfirmResponse,
} from "@/type/importTypes";
import ImportProgressBar from "@/components/import/ImportProgressBar";
import ImportMatchTable from "@/components/import/ImportMatchTable";
import ImportResultsSummary from "@/components/import/ImportResultsSummary";

type Phase =
  | "IDLE"
  | "PARSING_HASH"
  | "MATCHING"
  | "REVIEWING"
  | "CONFIRMING"
  | "DONE";

type Selection = { igdbId: number; platform: string };

export default function ImportPage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [error, setError] = useState<string | null>(null);

  // Matching state
  const [jobId, setJobId] = useState<string | null>(null);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [matches, setMatches] = useState<ImportMatchCandidate[]>([]);
  const [selections, setSelections] = useState<Map<number, Selection>>(
    new Map()
  );

  // Confirm result
  const [confirmResult, setConfirmResult] =
    useState<ImportConfirmResponse | null>(null);

  // Manual paste input
  const [pasteText, setPasteText] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("PC");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth check
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rs = await getMe();
        if (!alive) return;
        setUser(rs.data);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (alive) setAuthLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Parse hash data from bookmarklet on mount
  useEffect(() => {
    if (authLoading || !user) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#data=")) return;

    setPhase("PARSING_HASH");
    try {
      const encoded = hash.slice(6); // remove "#data="
      const json = decodeURIComponent(atob(encoded));
      const data = JSON.parse(json) as {
        platform?: string;
        games?: string[];
      };

      if (data.games && data.games.length > 0) {
        startMatchingFlow(data.games, data.platform || "PC");
      } else {
        setError("가져올 게임 목록이 비어 있습니다.");
        setPhase("IDLE");
      }
    } catch {
      setError("북마클릿 데이터를 파싱할 수 없습니다.");
      setPhase("IDLE");
    }
  }, [authLoading, user]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startMatchingFlow = useCallback(
    async (gameNames: string[], platform: string) => {
      if (!user) return;
      setError(null);
      setPhase("MATCHING");
      setTotal(gameNames.length);
      setProcessed(0);

      try {
        const { jobId: newJobId } = await startImportMatch(user.id, {
          gameNames,
          sourcePlatform: platform,
        });
        setJobId(newJobId);

        // Start polling
        pollRef.current = setInterval(async () => {
          try {
            const status = await pollImportJob(user.id, newJobId);
            setProcessed(status.processed);
            setTotal(status.total);

            if (status.status === "COMPLETED" && status.result) {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;

              setMatches(status.result.matches);

              // Auto-select all matched games that aren't already in library
              const autoSelect = new Map<number, Selection>();
              status.result.matches.forEach((m, idx) => {
                if (m.igdbId && !m.alreadyInLibrary) {
                  autoSelect.set(idx, {
                    igdbId: m.igdbId,
                    platform: m.suggestedPlatform || platform,
                  });
                }
              });
              setSelections(autoSelect);
              setPhase("REVIEWING");
            } else if (status.status === "FAILED") {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              setError("매칭 작업이 실패했습니다. 다시 시도해주세요.");
              setPhase("IDLE");
            }
          } catch {
            // poll error — keep trying
          }
        }, 2000);
      } catch (err: any) {
        setError(err?.msg || "매칭 시작에 실패했습니다.");
        setPhase("IDLE");
      }
    },
    [user]
  );

  const handleManualSubmit = () => {
    const names = pasteText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (names.length === 0) {
      setError("게임 이름을 최소 1개 입력해주세요.");
      return;
    }
    startMatchingFlow(names, sourcePlatform);
  };

  const handleConfirm = async () => {
    if (!user || selections.size === 0) return;
    setPhase("CONFIRMING");
    setError(null);

    try {
      const games = Array.from(selections.values()).map((s) => ({
        igdbId: s.igdbId,
        platform: s.platform,
      }));
      const result = await confirmImport(user.id, { games });
      setConfirmResult(result);
      setPhase("DONE");
    } catch (err: any) {
      setError(err?.msg || "가져오기에 실패했습니다.");
      setPhase("REVIEWING");
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#1a1c23] text-gray-200 flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">로그인이 필요합니다</h1>
          <p className="text-gray-500">
            게임을 가져오려면 로그인해주세요.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1a1c23] flex items-center justify-center">
        <p className="font-bold text-gray-500 text-sm italic uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20">
      {/* Header */}
      <div className="w-full bg-[#111217]/80 backdrop-blur-md sticky top-16 z-40 py-8 px-6 border-b border-white/5 shadow-2xl mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/library"
              className="text-gray-500 hover:text-white transition-colors"
            >
              &larr; 라이브러리
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">
              게임 가져오기
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            다른 플랫폼에서 보유한 게임을 한 번에 라이브러리에 추가하세요.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-3 rounded-2xl mb-8 text-sm">
            {error}
          </div>
        )}

        {/* IDLE — Manual Paste + Links */}
        {phase === "IDLE" && (
          <div className="space-y-8">
            {/* Quick Import Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/library/import/steam"
                className="bg-[#252833] border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-2xl mb-3">🎮</div>
                <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                  Steam
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Steam 계정 연동으로 보유 게임을 자동으로 가져옵니다.
                </p>
              </Link>

              <Link
                href="/library/import/bookmarklet"
                className="bg-[#252833] border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-2xl mb-3">🔖</div>
                <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">
                  북마클릿
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Epic Games, PlayStation 라이브러리에서 게임 목록을
                  스크랩합니다.
                </p>
              </Link>

              <div className="bg-[#252833] border border-blue-500/30 rounded-2xl p-6">
                <div className="text-2xl mb-3">📋</div>
                <h3 className="text-white font-bold">직접 입력</h3>
                <p className="text-gray-500 text-sm mt-1">
                  게임 이름을 직접 붙여넣어 가져옵니다.
                </p>
              </div>
            </div>

            {/* Manual Paste Area */}
            <div className="bg-[#252833] rounded-2xl border border-gray-700 p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">
                직접 입력으로 가져오기
              </h2>
              <p className="text-gray-500 text-sm">
                게임 이름을 한 줄에 하나씩 입력하세요.
              </p>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={
                  "The Witcher 3: Wild Hunt\nElden Ring\nCyberpunk 2077\nHades\n..."
                }
                rows={8}
                className="w-full bg-[#1a1c23] text-gray-200 px-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm"
              />

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    플랫폼
                  </label>
                  <select
                    value={sourcePlatform}
                    onChange={(e) => setSourcePlatform(e.target.value)}
                    className="bg-[#1a1c23] text-gray-200 px-4 py-2 rounded-xl border border-gray-600 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="PC">PC</option>
                    <option value="PS">PlayStation</option>
                    <option value="XBOX">Xbox</option>
                    <option value="NINTENDO">Nintendo</option>
                  </select>
                </div>

                <button
                  onClick={handleManualSubmit}
                  disabled={!pasteText.trim()}
                  className="mt-auto bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-500 transition-all active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  매칭 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MATCHING — Progress */}
        {(phase === "MATCHING" || phase === "PARSING_HASH") && (
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-8 space-y-6">
            <h2 className="text-xl font-bold text-white">
              게임 매칭 진행 중
            </h2>
            <ImportProgressBar processed={processed} total={total} />
            <p className="text-gray-500 text-sm">
              IGDB 데이터베이스에서 게임을 찾고 있습니다. 라이브러리 크기에 따라
              시간이 걸릴 수 있습니다.
            </p>
          </div>
        )}

        {/* REVIEWING — Match Table */}
        {phase === "REVIEWING" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                매칭 결과 확인
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhase("IDLE");
                    setMatches([]);
                    setSelections(new Map());
                  }}
                  className="bg-gray-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-600 transition-all text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selections.size === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition-all active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed text-sm"
                >
                  {selections.size}개 게임 가져오기
                </button>
              </div>
            </div>

            <ImportMatchTable
              matches={matches}
              selections={selections}
              onSelectionsChange={setSelections}
            />

            <div className="text-center">
              <button
                onClick={handleConfirm}
                disabled={selections.size === 0}
                className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {selections.size}개 게임 라이브러리에 추가
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMING — Spinner */}
        {phase === "CONFIRMING" && (
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">
              라이브러리에 추가 중...
            </h2>
            <p className="text-gray-500 text-sm">잠시만 기다려주세요.</p>
          </div>
        )}

        {/* DONE — Results */}
        {phase === "DONE" && confirmResult && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">
              가져오기 완료
            </h2>
            <ImportResultsSummary result={confirmResult} />
          </div>
        )}
      </div>
    </div>
  );
}
