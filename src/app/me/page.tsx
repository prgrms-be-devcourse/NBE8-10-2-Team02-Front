"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InlineBanner from "@/components/ui/InlineBanner";
import { apiFetch } from "@/lib/backend/client";
import {
  getMe,
  changePassword,
  changeNickname,
  type MeResponse,
} from "@/lib/backend/me";
import { logout } from "@/lib/backend/authApi";
import { pickMsg } from "@/lib/backend/types";

// 탭 타입에 "posts" 추가
type Tab = "profile" | "posts" | "account";

export default function MePage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("profile");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 게시글 상태 추가
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [postLoading, setPostLoading] = useState(false);

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
    return rs.data;
  };

  // 내 게시글 불러오기 함수
  const fetchMyPosts = async (currentMe: any) => {
    setPostLoading(true);
    try {
      // 백엔드 Repository가 아직 닉네임 검색을 지원하지 않으므로 전체를 가져와 필터링
      const res = await apiFetch("/api/v1/posts?size=100");
      const allPosts = res.data?.content || res.data || [];
      const filtered = allPosts.filter(
        (p: any) => p.authorName === currentMe.nickname,
      );
      setMyPosts(filtered);
    } catch (err) {
      console.error("게시글 로드 실패", err);
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setErrorMsg(null);
      try {
        const currentMe = await reloadMe();
        // 초기 로드 시 게시글도 미리 받아둠
        await fetchMyPosts(currentMe);
      } catch {
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
            <div className="mt-1 text-sm text-text-3">내 정보 및 활동 내역</div>
          </div>

          {/* 배너 */}
          <div className="mt-4 space-y-3">
            {errorMsg && <InlineBanner kind="error" message={errorMsg} />}
            {successMsg && <InlineBanner kind="success" message={successMsg} />}
          </div>

          {/* 탭 메뉴 */}
          <div className="mt-6 flex gap-2 border-b border-border pb-3">
            <button
              className={`btn ${tab === "profile" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("profile")}
            >
              내 정보
            </button>
            <button
              className={`btn ${tab === "posts" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("posts")}
            >
              작성 게시글
            </button>
            <button
              className={`btn ${tab === "account" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab("account")}
            >
              계정 설정
            </button>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="mt-6">
            {tab === "profile" && (
              <div className="space-y-3">
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
            )}

            {tab === "posts" && (
              <div className="space-y-3">
                {postLoading ? (
                  <div className="text-center py-10 text-sm text-text-3">
                    불러오는 중...
                  </div>
                ) : myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <Link
                      href={`/posts/${post.id}`}
                      key={post.id}
                      className="block rounded-xl border border-border bg-surface-2 px-4 py-4 hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-text-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </span>
                        <span className="text-[10px] text-text-3">
                          {post.createDate?.substring(0, 10)}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10 text-sm text-text-3 italic">
                    작성한 게시글이 없습니다.
                  </div>
                )}
              </div>
            )}

            {tab === "account" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="text-sm font-semibold text-text-1">
                    닉네임 변경
                  </div>
                  <form onSubmit={onChangeNickname} className="mt-3 space-y-3">
                    <input
                      className="input"
                      value={nicknameDraft}
                      onChange={(e) => setNicknameDraft(e.target.value)}
                      placeholder="새 닉네임"
                    />
                    <div className="text-xs text-text-3">
                      현재 닉네임:{" "}
                      <span className="text-text-2">{me.nickname}</span>
                    </div>
                    <button
                      className="btn btn-primary w-full"
                      disabled={nickPending}
                    >
                      {nickPending ? "변경 중..." : "닉네임 변경"}
                    </button>
                  </form>
                </div>

                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <div className="text-sm font-semibold text-text-1">
                    비밀번호 변경
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
                    <button
                      className="btn btn-primary w-full"
                      disabled={pwPending}
                    >
                      {pwPending ? "변경 중..." : "비밀번호 변경"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="mt-10 flex justify-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="btn min-w-[140px] bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/25"
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
