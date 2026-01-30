"use client";

import { useEffect, useState } from "react";

export default function TypingTitle() {
  const text = "게임 경재 살리기 프로젝트";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayText((prev) => prev + text[index]);
      setIndex((prev) => prev + 1);
    }, 120);

    return () => clearTimeout(timer);
  }, [index, text]);

  return (
    <div className="text-3xl sm:text-4xl font-black tracking-tighter mb-10 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent inline-block">
      {displayText}

      {/* 중요: 커서에 별도의 색상을 주고, fill-current 등을 초기화하거나 명시적 색상 적용 */}
      <span
        className="ml-1 animate-blink text-white opacity-100 select-none"
        style={{ WebkitTextFillColor: "white" }}
      >
        |
      </span>
    </div>
  );
}
