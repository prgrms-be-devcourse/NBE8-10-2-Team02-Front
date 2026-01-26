import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // 링크 이동을 위한 컴포넌트
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Gaming Board",
  description: "게시판 프로젝트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#444] text-white`}
      >
        {/* ✅ 글로벌 상단 헤더 (이미지 디자인 반영) */}
        <header className="bg-white text-black py-4 px-10 flex justify-between items-center sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-8">
            {/* 로고 영역 */}
            <Link
              href="/"
              className="hover:scale-105 transition active:scale-95"
            >
              <Image
                src="/GGS_logo.png" // public 폴더에 넣은 파일 이름 (확장자 주의!)
                alt="My Logo" // 이미지 설명
                width={50} // 로고 너비 (이미지 비율에 맞게 조절)
                height={50} // 로고 높이
                className="rounded-full" // 로고가 원형이라면 추가, 아니면 삭제
                priority // 로고는 중요하니까 먼저 로딩하게 설정
              />
            </Link>

            {/* 메뉴 영역 */}
            <nav className="flex gap-10 font-bold text-sm">
              <Link href="/posts" className="hover:text-blue-600 transition">
                게시판
              </Link>
              <button className="hover:text-blue-600 transition">
                라이브러리
              </button>
              <button className="hover:text-blue-600 transition">
                마이페이지
              </button>
            </nav>
          </div>

          {/* 우측 로그인 버튼 */}
          <button className="font-bold text-sm hover:underline">로그인</button>
        </header>

        {/* ✅ 실제 페이지 내용이 렌더링되는 영역 */}
        <main className="min-h-[calc(100vh-180px)]">{children}</main>

        {/* ✅ 글로벌 푸터 (이미지 하단 반영) */}
        <footer className="w-full py-10 bg-[#E0E0E0] text-[#666] text-center text-sm font-bold mt-auto">
          Footer
        </footer>
      </body>
    </html>
  );
}
