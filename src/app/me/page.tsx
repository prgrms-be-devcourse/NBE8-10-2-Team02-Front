"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InlineBanner from "@/components/ui/InlineBanner";
import { getMe, changePassword, type MeResponse } from "@/lib/backend/me";
import { logout } from "@/lib/backend/authApi";
import { pickMsg } from "@/lib/backend/types";

type Tab = "info" | "security";

export default function MePage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("info");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwPending, setPwPending] = useState(false);

  useEffect(() => {
    (async () => {
      setErrorMsg(null);
      try {
        const rs = await getMe();
        setMe(rs.data);
      } catch (err) {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const onLogout = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const rs = await logout();
      setSuccessMsg(rs.msg || "로그아웃 되었습니다.");
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "로그아웃에 실패했습니다."));
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPw.trim() || !newPw.trim()) {
      setErrorMsg("기존 비밀번호와 새 비밀번호를 입력해주세요.");
      return;
    }

    setPwPending(true);
    try {
      const rs = await changePassword(oldPw, newPw);
      setSuccessMsg(rs.msg || "비밀번호가 변경되었습니다.");
      setOldPw("");
      setNewPw("");
      setTab("info");
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "비밀번호 변경에 실패했습니다."));
    } finally {
      setPwPending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-180px)] bg-bg text-text-1 grid place-items-center">
        <div className="card p-6">로딩 중...</div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-[calc(100vh-180px)] bg-bg text-text-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="card p-6">
          {/* 상단 제목 */}
          <div>
            <div className="text-lg font-semibold">마이페이지</div>
            <div className="mt-1 text-sm text-text-3">내 정보 및 보안 설정</div>
          </div>

          {/* 배너 */}
          <div className="mt-4 space-y-3">
            {errorMsg && <InlineBanner kind="error" message={errorMsg} />}
            {successMsg && <InlineBanner kind="success" message={successMsg} />}
          </div>

          {/* 탭 */}
          <div className="mt-6 flex gap-2 border-b border-border pb-3">
            <button
              className={`btn ${tab === "info" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("info")}
              type="button"
            >
              정보
            </button>
            <button
              className={`btn ${tab === "security" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("security")}
              type="button"
            >
              보안
            </button>
          </div>

          {/* 컨텐츠 */}
          {tab === "info" ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="text-xs text-text-3">이메일</div>
                <div className="mt-1 text-sm font-medium text-text-1 break-all">{me.email}</div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="text-xs text-text-3">닉네임</div>
                <div className="mt-1 text-sm font-medium text-text-1">{me.nickname}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={onChangePassword} className="mt-6 space-y-4">
              <div>
                <div className="mb-1 text-sm text-text-2">기존 비밀번호</div>
                <input
                  className="input"
                  type="password"
                  value={oldPw}
                  onChange={(e) => setOldPw(e.target.value)}
                  placeholder="••••"
                />
              </div>

              <div>
                <div className="mb-1 text-sm text-text-2">새 비밀번호</div>
                <input
                  className="input"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••"
                />
              </div>

              <button className="btn btn-primary w-full" disabled={pwPending}>
                {pwPending ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          )}

          {/* ✅ 맨밑 중앙 버튼 */}
          <div className="mt-10 flex justify-center gap-3">
  <button
    type="button"
    onClick={onLogout}
    className="btn min-w-[140px] bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/25 active:bg-red-500/35"
  >
    로그아웃
  </button>

  <button
    type="button"
    className="btn btn-secondary min-w-[140px]"
    onClick={() => router.push("/")}
  >
    홈으로
  </button>
</div>
        </div>
      </div>
    </div>
  );
}
