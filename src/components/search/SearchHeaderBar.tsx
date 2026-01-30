"use client";

import { useState, useEffect } from "react"; // useEffect 추가
import Image from "next/image";
import { useGameSearch } from "@/hooks/useGameSearch";

export default function SearchHeaderBar({
  initialKeyword,
}: {
  initialKeyword: string;
}) {
  // 1. 초기값에 빈 문자열("")을 보장해줍니다. (undefined 방지)
  const [keyword, setKeyword] = useState(initialKeyword || "");
  const { search } = useGameSearch();

  // 2. URL이 직접 바뀌었을 때(예: 뒤로가기) 입력창의 텍스트도 업데이트되도록 설정
  useEffect(() => {
    setKeyword(initialKeyword || "");
  }, [initialKeyword]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!search(keyword)) {
          alert("검색어를 입력해주세요!");
        }
        search(keyword);
      }}
      className="relative flex items-center"
    >
      <input
        // 3. 여기서도 한번 더 빈 문자열을 보장해줍니다.
        value={keyword ?? ""}
        onChange={(e) => setKeyword(e.target.value)}
        className="
          w-[400px] h-[45px]
          pl-3 pr-10
          rounded-full
          bg-white text-black
          border border-gray-300
          shadow-sm
          outline-none
          focus:ring-0
          focus:shadow-md
        "
        placeholder="다른 게임도 즐겨봐!"
      />

      <button
        type="submit"
        className="
          absolute right-2
          top-1/2 -translate-y-1/2
          cursor-pointer
          pr-2
        "
      >
        <Image src="/images/search.svg" alt="search" width={16} height={16} />
      </button>
    </form>
  );
}
