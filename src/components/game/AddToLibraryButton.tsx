"use client";

import { useState } from "react";
import { getMe } from "@/lib/backend/me";
import { addToLibrary } from "@/lib/backend/libraryApi";

export default function AddToLibraryButton({ gameId }: { gameId: number }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleClick = async () => {
    if (state === "loading" || state === "done") return;
    setState("loading");

    try {
      const me = await getMe();
      await addToLibrary(me.data.id, {
        gameId,
        platform: "",
        playtime: 0,
        isFavorite: false,
        status: "PLAN_TO_PLAY",
      });
      setState("done");
      setMsg("라이브러리에 추가됨!");
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setMsg("로그인이 필요합니다");
      } else {
        setMsg(err?.msg ?? "추가 실패");
      }
      setState("error");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading" || state === "done"}
      className={`btn text-xs whitespace-nowrap ${
        state === "done"
          ? "btn-secondary opacity-70 cursor-default"
          : state === "error"
            ? "btn-secondary"
            : "btn-primary"
      }`}
      title={msg || undefined}
    >
      {state === "loading"
        ? "..."
        : state === "done"
          ? "추가 완료"
          : state === "error"
            ? "다시 시도"
            : "라이브러리에 추가"}
    </button>
  );
}
