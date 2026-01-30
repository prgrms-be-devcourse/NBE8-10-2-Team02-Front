"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getMeOrNull, type MeResponse } from "@/lib/backend/me";
import { logout } from "@/lib/backend/authApi";
import { pickMsg } from "@/lib/backend/types";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type AuthState =
  | { status: "checking"; me: null }
  | { status: "guest"; me: null }
  | { status: "authed"; me: MeResponse };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [auth, setAuth] = useState<AuthState>({ status: "checking", me: null });
  const [logoutPending, setLogoutPending] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const me = await getMeOrNull(); // 401이면 null
      if (me) setAuth({ status: "authed", me });
      else setAuth({ status: "guest", me: null });
    } catch (err) {
      console.error(pickMsg(err, "me 조회 실패"));
      setAuth({ status: "guest", me: null });
    }
  }, []);

  // ✅ 앱 시작 시 1회만 실행
  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  // ✅ 로그인/로그아웃 같은 "인증 상태 변경"이 일어났을 때만 재조회
  useEffect(() => {
    const handler = () => {
      refreshMe();
    };
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  }, [refreshMe]);

  const onLogout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);

    try {
      await logout();
    } catch (err: any) {
      console.error(pickMsg(err, "로그아웃 실패"));
    } finally {
      // UI 먼저 게스트로 돌림
      setAuth({ status: "guest", me: null });
      // (선택) 일관성 있게 이벤트도 쏴줘도 됨
      window.dispatchEvent(new Event("auth:changed"));

      setLogoutPending(false);
      router.push("/");
      router.refresh(); // 있어도 되고 없어도 됨
    }
  };

  const getMenuButtonStyle = (path: string) => {
    const isActive = pathname.startsWith(path);
    return `
      group relative px-6 py-3 rounded-2xl font-black text-[16px] uppercase tracking-wider transition-all duration-200 active:scale-90
      ${
        isActive
          ? "text-blue-400 bg-blue-500/15 shadow-inner shadow-blue-500/10"
          : "text-gray-400 hover:text-white hover:bg-white/10"
      }
    `;
  };

  const isAuthed = auth.status === "authed";

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1c23] text-gray-200 flex flex-col min-h-screen`}
      >
        <header className="bg-[#111217]/95 backdrop-blur-xl text-white py-4 px-10 flex justify-between items-center sticky top-0 z-50 border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="hover:scale-105 transition-transform active:scale-95 flex items-center gap-3 shrink-0"
            >
              <Image
                src="/GGS_logo.png"
                alt="My Logo"
                width={42}
                height={42}
                className="rounded-xl shadow-lg shadow-blue-600/30"
                priority
              />
              <span className="font-black text-2xl tracking-tighter italic bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent pr-2 leading-none">
                GGS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-3">
              <Link href="/posts" className={getMenuButtonStyle("/posts")}>
                게시판
              </Link>

              <Link href="/library" className={getMenuButtonStyle("/library")}>
                라이브러리
              </Link>

              <Link href="/me" className={getMenuButtonStyle("/me")}>
                내 페이지
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {auth.status === "checking" ? null : !isAuthed ? (
              <>
                <Link
                  href="/auth/signup"
                  className="text-[13px] font-black uppercase tracking-widest bg-white/10 px-6 py-3 rounded-2xl hover:bg-white/15 transition-all active:scale-95 border border-white/10"
                >
                  Signup
                </Link>
                <Link
                  href="/auth/login"
                  className="text-[13px] font-black uppercase tracking-widest bg-blue-600 px-7 py-3 rounded-2xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                >
                  Login
                </Link>
              </>
            ) : (
              <button
                onClick={onLogout}
                disabled={logoutPending}
                className="text-[13px] font-black uppercase tracking-widest bg-red-500/20 px-7 py-3 rounded-2xl hover:bg-red-500/25 transition-all active:scale-95 border border-red-500/30"
              >
                {logoutPending ? "..." : "Logout"}
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow bg-bg text-text-1">{children}</main>
      </body>
    </html>
  );
}
