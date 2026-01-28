"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import InlineBanner from "@/components/ui/InlineBanner";
import { login } from "@/lib/backend/authApi";
import { pickMsg } from "@/lib/backend/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ✅ 회원가입 등에서 넘어온 success 표시
  // - success 값이 뭐든 "회원가입이 완료되었습니다. 로그인해주세요." 로 고정
  // - 한번 표시 후 쿼리 제거 (새로고침/뒤로가기 반복 방지)
  useEffect(() => {
    const s = searchParams.get("success");
    if (!s) return;

    setSuccessMsg("회원가입이 완료되었습니다. 로그인해주세요.");
    router.replace("/auth/login");
  }, [searchParams, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setPending(true);
    try {
      await login(email.trim(), password);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "로그인에 실패했습니다."));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthCard title="로그인" sub="이메일과 비밀번호로 로그인합니다.">
      <form onSubmit={onSubmit} className="space-y-4">
        {errorMsg && <InlineBanner kind="error" message={errorMsg} />}
        {successMsg && <InlineBanner kind="success" message={successMsg} />}

        <div>
          <div className="mb-1 text-sm text-text-2">이메일</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user1@test.com"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="mb-1 text-sm text-text-2">비밀번호</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••"
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary w-full" disabled={pending}>
          {pending ? "로그인 중..." : "로그인"}
        </button>

        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => router.push("/auth/signup")}
        >
          회원가입으로
        </button>
      </form>
    </AuthCard>
  );
}
