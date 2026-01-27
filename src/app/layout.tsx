"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // 메뉴 버튼 스타일 (크기 + 피드백 강화)
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

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1c23] text-gray-200 flex flex-col min-h-screen`}
      >
        {/* --- 헤더 --- */}
        <header className="bg-[#111217]/95 backdrop-blur-xl text-white py-4 px-10 flex justify-between items-center sticky top-0 z-50 border-b border-white/10 shadow-2xl">
          <div className="flex items-center gap-12">
            {/* 로고 영역: S 짤림 방지를 위해 pr-2 및 여백 재배치 */}
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

            {/* 내비게이션 */}
            <nav className="hidden md:flex items-center gap-3">
              <Link href="/posts" className={getMenuButtonStyle("/posts")}>
                게시판
                <span
                  className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-1 bg-blue-500 rounded-full transition-all duration-300 ${pathname.startsWith("/posts") ? "w-6" : "w-0 group-hover:w-4"}`}
                ></span>
              </Link>

              <button className="group relative px-6 py-3 rounded-2xl font-black text-[16px] uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                라이브러리
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-0 bg-gray-500 rounded-full transition-all duration-300 group-hover:w-4"></span>
              </button>

              <button className="group relative px-6 py-3 rounded-2xl font-black text-[16px] uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                내 페이지
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-0 bg-gray-500 rounded-full transition-all duration-300 group-hover:w-4"></span>
              </button>
            </nav>
          </div>

          {/* 로그인 버튼 */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-[13px] font-black uppercase tracking-widest bg-blue-600 px-7 py-3 rounded-2xl hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all active:scale-95 shadow-lg shadow-blue-900/40"
            >
              Login
            </Link>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow">{children}</main>

        {/* 푸터 */}
        <footer className="w-full py-14 bg-[#0d0e12] border-t border-white/5 text-gray-600 text-center">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-left">
                <p className="font-black text-gray-300 tracking-tighter italic text-xl mb-1">
                  GGS
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">
                  Next Gen Gaming Community
                </p>
              </div>
              <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-gray-500">
                <span className="hover:text-blue-500 cursor-pointer transition-colors">
                  Terms
                </span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">
                  Privacy
                </span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">
                  Support
                </span>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 text-[10px] uppercase tracking-[0.4em]">
              © 2026 GGS Project. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
