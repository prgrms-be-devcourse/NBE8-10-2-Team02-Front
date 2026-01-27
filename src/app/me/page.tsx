"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InlineBanner from "@/components/ui/InlineBanner";
import {
  getMe,
  changePassword,
  changeNickname,
  type MeResponse,
} from "@/lib/backend/me";
import { logout } from "@/lib/backend/authApi";
import { pickMsg } from "@/lib/backend/types";

type Tab = "profile" | "account";

export default function MePage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("profile");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // password
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwPending, setPwPending] = useState(false);

  // nickname
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [nickPending, setNickPending] = useState(false);

  const reloadMe = async () => {
    const rs = await getMe();
    setMe(rs.data);
    setNicknameDraft(rs.data.nickname ?? "");
  };

  useEffect(() => {
    (async () => {
      setErrorMsg(null);
      try {
        await reloadMe();
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const onLogout = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const rs = await logout();
      // 홈에서 메시지를 보여주고 싶으면 success를 넘기는 방식
      const msg = encodeURIComponent(rs.msg || "로그아웃 되었습니다.");
      router.push(`/?success=${msg}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "로그아웃에 실패했습니다."));
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
      setTab("profile");
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "비밀번호 변경에 실패했습니다."));
    } finally {
      setPwPending(false);
    }
  };

  const onChangeNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nextNick = nicknameDraft.trim();
    if (!nextNick) {
      setErrorMsg("새 닉네임을 입력해주세요.");
      return;
    }

    // 프론트 즉시 피드백(선택): 너무 빡세게 하드코딩 싫으면 이 부분 지워도 됨
    if (nextNick.length < 2 || nextNick.length > 30) {
      setErrorMsg("닉네임은 2~30자여야 합니다.");
      return;
    }

    // 같은 닉네임이면 굳이 요청 안 보내기(UX)
    if (me?.nickname === nextNick) {
      setErrorMsg("현재 닉네임과 동일합니다.");
      return;
    }

    setNickPending(true);
    try {
      const rs = await changeNickname(nextNick);
      setSuccessMsg(rs.msg || "닉네임이 변경되었습니다.");
      await reloadMe();
      setTab("profile");
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "닉네임 변경에 실패했습니다."));
    } finally {
      setNickPending(false);
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
            <div className="mt-1 text-sm text-text-3">내 정보 및 계정 설정</div>
          </div>

          {/* 배너 */}
          <div className="mt-4 space-y-3">
            {errorMsg && <InlineBanner kind="error" message={errorMsg} />}
            {successMsg && <InlineBanner kind="success" message={successMsg} />}
          </div>

          {/* 탭 */}
          <div className="mt-6 flex gap-2 border-b border-border pb-3">
            <button
              className={`btn ${tab === "profile" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("profile")}
              type="button"
            >
              내 정보
            </button>
            <button
              className={`btn ${tab === "account" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("account")}
              type="button"
            >
              계정 설정
            </button>
          </div>

          {/* 컨텐츠 */}
          {tab === "profile" ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="text-xs text-text-3">이메일</div>
                <div className="mt-1 text-sm font-medium text-text-1 break-all">
                  {me.email}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="text-xs text-text-3">닉네임</div>
                <div className="mt-1 text-sm font-medium text-text-1">
                  {me.nickname}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* 닉네임 변경 섹션 */}
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="text-sm font-semibold text-text-1">닉네임 변경</div>
                <div className="mt-1 text-xs text-text-3">
                  2~30자, 중복 불가
                </div>

                <form onSubmit={onChangeNickname} className="mt-3 space-y-3">
                  <input
                    className="input"
                    value={nicknameDraft}
                    onChange={(e) => setNicknameDraft(e.target.value)}
                    placeholder="새 닉네임"
                  />
                  {/* ✅ 원하는 스타일: 입력창 밑 문구(스크린샷 느낌) */}
                  <div className="text-xs text-text-3">
                    현재 닉네임: <span className="text-text-2">{me.nickname}</span>
                  </div>

                  <button className="btn btn-primary w-full" disabled={nickPending}>
                    {nickPending ? "변경 중..." : "닉네임 변경"}
                  </button>
                </form>
              </div>

              {/* 비밀번호 변경 섹션 */}
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="text-sm font-semibold text-text-1">비밀번호 변경</div>
                <div className="mt-1 text-xs text-text-3">
                  기존 비밀번호 확인 후 변경합니다.
                </div>

                <form onSubmit={onChangePassword} className="mt-3 space-y-3">
                  <input
                    className="input"
                    type="password"
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                    placeholder="기존 비밀번호"
                  />
                  <input
                    className="input"
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="새 비밀번호"
                  />
                  <button className="btn btn-primary w-full" disabled={pwPending}>
                    {pwPending ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
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
