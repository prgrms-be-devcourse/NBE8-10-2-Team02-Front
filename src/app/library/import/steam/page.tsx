"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMe, type MeResponse } from "@/lib/backend/me";
import { getSteamAuthUrl, importSteamGames } from "@/lib/backend/steamApi";
import { pollImportJob, confirmImport } from "@/lib/backend/importApi";
import type {
  ImportMatchCandidate,
  ImportConfirmResponse,
} from "@/type/importTypes";
import ImportProgressBar from "@/components/import/ImportProgressBar";
import ImportMatchTable from "@/components/import/ImportMatchTable";
import ImportResultsSummary from "@/components/import/ImportResultsSummary";

type Phase =
  | "IDLE"
  | "CONNECTING"
  | "MATCHING"
  | "REVIEWING"
  | "CONFIRMING"
  | "DONE";

type Selection = { igdbId: number; platform: string };

export default function SteamImportPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [error, setError] = useState<string | null>(null);

  // Matching state
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [matches, setMatches] = useState<ImportMatchCandidate[]>([]);
  const [selections, setSelections] = useState<Map<number, Selection>>(
    new Map()
  );
  const [confirmResult, setConfirmResult] =
    useState<ImportConfirmResponse | null>(null);

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

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = useCallback(
    (jobId: string) => {
      if (!user) return;
      pollRef.current = setInterval(async () => {
        try {
          const status = await pollImportJob(user.id, jobId);
          setProcessed(status.processed);
          setTotal(status.total);

          if (status.status === "COMPLETED" && status.result) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setMatches(status.result.matches);

            const autoSelect = new Map<number, Selection>();
            status.result.matches.forEach((m, idx) => {
              if (m.igdbId && !m.alreadyInLibrary) {
                autoSelect.set(idx, {
                  igdbId: m.igdbId,
                  platform: m.suggestedPlatform || "PC",
                });
              }
            });
            setSelections(autoSelect);
            setPhase("REVIEWING");
          } else if (status.status === "FAILED") {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setError("매칭 작업이 실패했습니다.");
            setPhase("IDLE");
          }
        } catch {
          // keep trying
        }
      }, 2000);
    },
    [user]
  );

  // Handle Steam callback with steamId in URL
  useEffect(() => {
    if (authLoading || !user) return;
    const steamId = searchParams.get("steamId");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Steam 인증에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    if (steamId) {
      setPhase("MATCHING");
      (async () => {
        try {
          const { jobId } = await importSteamGames(user.id, steamId);
          startPolling(jobId);
        } catch (err: any) {
          setError(err?.msg || "Steam 게임 가져오기에 실패했습니다.");
          setPhase("IDLE");
        }
      })();
    }
  }, [authLoading, user, searchParams, startPolling]);

  const handleConnectSteam = async () => {
    setPhase("CONNECTING");
    setError(null);
    try {
      const { url } = await getSteamAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      setError(err?.msg || "Steam 인증 URL을 가져올 수 없습니다.");
      setPhase("IDLE");
    }
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
            Steam 게임을 가져오려면 로그인해주세요.
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
              href="/library/import"
              className="text-gray-500 hover:text-white transition-colors"
            >
              &larr; 가져오기
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Steam 가져오기
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Steam 계정을 연동하여 보유한 게임을 자동으로 가져옵니다.
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

        {/* IDLE — Connect Button */}
        {phase === "IDLE" && (
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-12 text-center space-y-6">
            <div className="text-6xl">🎮</div>
            <h2 className="text-2xl font-bold text-white">
              Steam 계정 연동
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Steam에 로그인하여 보유한 게임 목록을 자동으로 가져옵니다. Steam
              프로필이 공개로 설정되어 있어야 합니다.
            </p>
            <button
              onClick={handleConnectSteam}
              className="bg-[#1b2838] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#2a475e] transition-all active:scale-95 text-lg"
            >
              Steam으로 로그인
            </button>
            <p className="text-gray-600 text-xs">
              Steam OpenID를 통해 안전하게 인증됩니다. 비밀번호는 저장되지
              않습니다.
            </p>
          </div>
        )}

        {/* CONNECTING — Redirecting */}
        {phase === "CONNECTING" && (
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">
              Steam으로 이동 중...
            </h2>
          </div>
        )}

        {/* MATCHING — Progress */}
        {phase === "MATCHING" && (
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-8 space-y-6">
            <h2 className="text-xl font-bold text-white">
              Steam 게임 매칭 진행 중
            </h2>
            <ImportProgressBar processed={processed} total={total} />
            <p className="text-gray-500 text-sm">
              Steam 라이브러리에서 가져온 게임을 IGDB 데이터베이스와 매칭하고
              있습니다.
            </p>
          </div>
        )}

        {/* REVIEWING */}
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

        {/* CONFIRMING */}
        {phase === "CONFIRMING" && (
          <div className="bg-[#252833] rounded-2xl border border-gray-700 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">
              라이브러리에 추가 중...
            </h2>
            <p className="text-gray-500 text-sm">잠시만 기다려주세요.</p>
          </div>
        )}

        {/* DONE */}
        {phase === "DONE" && confirmResult && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">
              Steam 가져오기 완료
            </h2>
            <ImportResultsSummary result={confirmResult} />
          </div>
        )}
      </div>
    </div>
  );
}
