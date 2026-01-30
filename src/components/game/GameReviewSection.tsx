"use client";

import { ReactNode, useState } from "react";
import GameMyReview from "./GameMyReview";
import GameReviewList from "./GameReviewList";

export default function GameReviewSection({ gameId, children }: { gameId: number; children?: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <GameMyReview
        gameId={gameId}
        onReviewChange={() => setRefreshKey((k) => k + 1)}
      />
      {children}
      <GameReviewList gameId={gameId} refreshKey={refreshKey} />
    </>
  );
}
