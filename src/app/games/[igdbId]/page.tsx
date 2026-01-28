// src/app/games/[igdbId]/page.tsx
import {
  getGameDetail,
  getGameVideo,
  getSimilarGames,
} from "@/lib/backend/gameApi";
import GameHero from "@/components/game/GameHero";
import GameTrailer from "@/components/game/GameTrailer";
import GameMeta from "@/components/game/GameMeta";
import SimilarGamesRail from "@/components/game/SimilarGamesRail";
import GameMyReview from "@/components/game/GameMyReview";
import GameReviewList from "@/components/game/GameReviewList";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ igdbId: string }>;
}) {
  const { igdbId: igdbIdParam } = await params;
  const igdbId = Number(igdbIdParam);

  const [detail, video, similar] = await Promise.all([
    getGameDetail(igdbId),
    getGameVideo(igdbId).catch(() => ({ videoId: "", trailerEmbedUrl: "" })), // 트레일러 없을 수 있음
    getSimilarGames(igdbId).catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10 space-y-6">
        <GameHero detail={detail} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <GameTrailer video={video} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <GameMeta detail={detail} />
          </div>
        </div>

        <GameMyReview gameId={detail.gameId} />

        <SimilarGamesRail games={similar} />

        <GameReviewList gameId={detail.gameId} />
      </div>
    </div>
  );
}
