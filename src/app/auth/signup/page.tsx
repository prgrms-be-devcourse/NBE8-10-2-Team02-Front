"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import InlineBanner from "@/components/ui/InlineBanner";
import {
  signup,
  checkEmailAvailable,
  checkNicknameAvailable,
} from "@/lib/backend/authApi";
import { pickMsg } from "@/lib/backend/types";

type CheckState = "idle" | "invalid" | "checking" | "ok" | "dup" | "error";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [emailState, setEmailState] = useState<CheckState>("idle");
  const [nickState, setNickState] = useState<CheckState>("idle");
  const [pwState, setPwState] = useState<CheckState>("idle");

  // 레이스 방지: 최신 요청만 반영
  const emailReqId = useRef(0);
  const nickReqId = useRef(0);

  // ✅ 이메일 자동 체크
  useEffect(() => {
    const v = email.trim();
    if (!v) return setEmailState("idle");
    if (!isValidEmail(v)) return setEmailState("invalid");

    setEmailState("checking");
    const myId = ++emailReqId.current;

    const t = setTimeout(async () => {
      try {
        const ok = await checkEmailAvailable(v);
        if (emailReqId.current !== myId) return;
        setEmailState(ok ? "ok" : "dup");
      } catch {
        if (emailReqId.current !== myId) return;
        setEmailState("error");
      }
    }, 400);

    return () => clearTimeout(t);
  }, [email]);

  // ✅ 닉네임 자동 체크
  useEffect(() => {
    const v = nickname.trim();
    if (!v) return setNickState("idle");
    if (v.length < 2 || v.length > 30) return setNickState("invalid");

    setNickState("checking");
    const myId = ++nickReqId.current;

    const t = setTimeout(async () => {
      try {
        const ok = await checkNicknameAvailable(v);
        if (nickReqId.current !== myId) return;
        setNickState(ok ? "ok" : "dup");
      } catch {
        if (nickReqId.current !== myId) return;
        setNickState("error");
      }
    }, 400);

    return () => clearTimeout(t);
  }, [nickname]);

  // ✅ 비밀번호(4~50자) 즉시 검증
  useEffect(() => {
    const v = password;

    if (!v) return setPwState("idle");
    if (v.length < 4 || v.length > 50) return setPwState("invalid");

    setPwState("ok");
  }, [password]);

  const canSubmit = useMemo(() => {
    const filled = email.trim() && nickname.trim() && password.trim();
    const checksOk =
      emailState === "ok" && nickState === "ok" && pwState === "ok";
    const notChecking = emailState !== "checking" && nickState !== "checking";
    return Boolean(filled && checksOk && notChecking && !pending);
  }, [email, nickname, password, emailState, nickState, pwState, pending]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !nickname.trim() || !password.trim()) {
      setErrorMsg("이메일/닉네임/비밀번호를 모두 입력해주세요.");
      return;
    }
    if (emailState !== "ok") {
      setErrorMsg("이메일 중복 확인을 완료해주세요.");
      return;
    }
    if (nickState !== "ok") {
      setErrorMsg("닉네임 중복 확인을 완료해주세요.");
      return;
    }
    if (pwState !== "ok") {
      setErrorMsg("비밀번호를 조건에 맞게 입력해주세요.");
      return;
    }

    setPending(true);
    try {
      const rs = await signup(email.trim(), password, nickname.trim());
      // ✅ 로그인 페이지로 성공 메시지 전달
      const msg = encodeURIComponent(rs.msg || "회원가입이 완료되었습니다. 로그인해주세요.");
      router.push(`/auth/login?success=${msg}`);
    } catch (err: any) {
      setErrorMsg(pickMsg(err, "회원가입에 실패했습니다."));
    } finally {
      setPending(false);
    }
  };

  const EmailHint = () => {
    if (emailState === "idle") return null;
    if (emailState === "invalid")
      return (
        <div className="mt-1 text-xs text-red-300">
          이메일 형식이 올바르지 않습니다.
        </div>
      );
    if (emailState === "checking")
      return (
        <div className="mt-1 text-xs text-text-3">이메일 중복 확인 중...</div>
      );
    if (emailState === "dup")
      return (
        <div className="mt-1 text-xs text-red-300">
          이미 사용 중인 이메일입니다.
        </div>
      );
    if (emailState === "ok")
      return (
        <div className="mt-1 text-xs text-emerald-300">
          사용 가능한 이메일입니다.
        </div>
      );
    return (
      <div className="mt-1 text-xs text-red-300">
        이메일 확인 중 오류가 발생했습니다.
      </div>
    );
  };

  const NickHint = () => {
    if (nickState === "idle") return null;
    if (nickState === "invalid")
      return (
        <div className="mt-1 text-xs text-red-300">
          닉네임은 2~30자여야 합니다.
        </div>
      );
    if (nickState === "checking")
      return (
        <div className="mt-1 text-xs text-text-3">닉네임 중복 확인 중...</div>
      );
    if (nickState === "dup")
      return (
        <div className="mt-1 text-xs text-red-300">
          이미 사용 중인 닉네임입니다.
        </div>
      );
    if (nickState === "ok")
      return (
        <div className="mt-1 text-xs text-emerald-300">
          사용 가능한 닉네임입니다.
        </div>
      );
    return (
      <div className="mt-1 text-xs text-red-300">
        닉네임 확인 중 오류가 발생했습니다.
      </div>
    );
  };

  const PwHint = () => {
    if (pwState === "idle") return null;
    if (pwState === "invalid")
      return (
        <div className="mt-1 text-xs text-red-300">
          비밀번호는 4~50자여야 합니다.
        </div>
      );
    // 원하면 ok 문구도 표시 가능 (지금은 깔끔하게 안 띄움)
    return null;
  };

  return (
    <AuthCard title="회원가입" sub="이메일/닉네임/비밀번호로 가입합니다.">
      <form onSubmit={onSubmit} className="space-y-4">
        {errorMsg && <InlineBanner kind="error" message={errorMsg} />}

        <div>
          <div className="mb-1 text-sm text-text-2">이메일</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <EmailHint />
        </div>

        <div>
          <div className="mb-1 text-sm text-text-2">닉네임</div>
          <input
            className="input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <NickHint />
        </div>

        <div>
          <div className="mb-1 text-sm text-text-2">비밀번호</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <PwHint />
        </div>

        <button className="btn btn-primary w-full" disabled={!canSubmit}>
          {pending ? "가입 중..." : "회원가입"}
        </button>

        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => router.push("/auth/login")}
        >
          로그인으로 돌아가기
        </button>
      </form>
    </AuthCard>
  );
}
