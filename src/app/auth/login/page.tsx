"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState(""); // UI상 아이디 입력란
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ 백엔드 컨트롤러의 @RequestMapping("/api/v1/auth") 및 @PostMapping("/login") 확인
      const res = await apiFetch("/api/v1/auth/login", {
        method: "POST",
        // ✅ AuthLoginRequest 레코드의 @NotBlank String email 필드명에 맞춤
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      if (res.resultCode && res.resultCode.startsWith("200")) {
        // ✅ AuthLoginResponse의 nickname 필드 활용
        alert(`${res.data.nickname}님 환영합니다!`);
        router.push("/");
      } else {
        alert(res.msg || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      alert("이메일 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded outline-none focus:ring-1 focus:ring-black"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded outline-none focus:ring-1 focus:ring-black"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded font-bold hover:bg-gray-800 transition"
          >
            로그인하기
          </button>
        </div>
      </form>
    </div>
  );
}
