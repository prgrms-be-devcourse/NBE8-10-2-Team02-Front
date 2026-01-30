"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getLibrary,
  updateLibraryGame,
  removeFromLibrary,
} from "@/lib/backend/libraryApi";
import { getMe, type MeResponse } from "@/lib/backend/me";
import {
  MemberGameDto,
  StatusEnum,
  STATUS_CONFIG,
  PLATFORM_OPTIONS,
  MemberGameUpdateRequest,
} from "@/type/libraryTypes";

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoadingState />}>
      <LibraryContent />
    </Suspense>
  );
}

function LibraryLoadingState() {
  return (
    <div className="min-h-screen bg-[#1a1c23] flex items-center justify-center">
      <p className="font-bold text-gray-500 text-sm italic uppercase tracking-widest animate-pulse">
        Loading Library...
      </p>
    </div>
  );
}

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth state
  const [user, setUser] = useState<MeResponse | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Library state
  const [games, setGames] = useState<MemberGameDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState<{
    totalPages: number;
    totalElements: number;
    number: number;
  } | null>(null);

  // Filter state
  const statusFilter = (searchParams.get("status") as StatusEnum) || "";
  const platformFilter = searchParams.get("platform") || "";
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Edit modal state
  const [editingGame, setEditingGame] = useState<MemberGameDto | null>(null);
  const [editForm, setEditForm] = useState<MemberGameUpdateRequest>({});
  const [editPending, setEditPending] = useState(false);

  // Delete confirmation state
  const [deletingGame, setDeletingGame] = useState<MemberGameDto | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  // Check authentication
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rs = await getMe();
        if (!alive) return;
        setUser(rs.data);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (alive) setAuthLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch library
  useEffect(() => {
    if (authLoading || !user) return;

    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getLibrary(
          user.id,
          currentPage,
          20,
          statusFilter || undefined,
          platformFilter || undefined
        );
        if (!alive) return;
        setGames(data.content);
        setPageInfo({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          number: data.number,
        });
      } catch (err) {
        console.error("Failed to fetch library:", err);
        if (alive) setGames([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, authLoading, currentPage, statusFilter, platformFilter]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "0");
    router.push(`/library?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/library?${params.toString()}`);
  };

  // Handle edit
  const openEditModal = (game: MemberGameDto) => {
    setEditingGame(game);
    setEditForm({
      platform: game.platform,
      playtime: game.playtime,
      isFavorite: game.isFavorite,
      status: game.status,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingGame || !user) return;
    setEditPending(true);
    try {
      await updateLibraryGame(user.id, editingGame.id, editForm);
      // Refresh the library
      const data = await getLibrary(
        user.id,
        currentPage,
        20,
        statusFilter || undefined,
        platformFilter || undefined
      );
      setGames(data.content);
      setEditingGame(null);
    } catch (err) {
      console.error("Failed to update game:", err);
      alert("게임 정보 업데이트에 실패했습니다.");
    } finally {
      setEditPending(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingGame || !user) return;
    setDeletePending(true);
    try {
      await removeFromLibrary(user.id, deletingGame.id);
      // Refresh the library
      const data = await getLibrary(
        user.id,
        currentPage,
        20,
        statusFilter || undefined,
        platformFilter || undefined
      );
      setGames(data.content);
      setPageInfo({
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        number: data.number,
      });
      setDeletingGame(null);
    } catch (err) {
      console.error("Failed to delete game:", err);
      alert("게임 삭제에 실패했습니다.");
    } finally {
      setDeletePending(false);
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#1a1c23] text-gray-200 flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">로그인이 필요합니다</h1>
          <p className="text-gray-500">
            라이브러리를 이용하려면 로그인해주세요.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1c23] text-gray-200 pb-20 font-sans selection:bg-blue-500/30 tracking-tight">
      {/* Header Section */}
      <div className="w-full bg-[#111217]/80 backdrop-blur-md sticky top-16 z-40 py-8 px-6 border-b border-white/5 shadow-2xl mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                내 라이브러리
              </h1>
              <p className="text-gray-500 text-sm">
                {pageInfo
                  ? `총 ${pageInfo.totalElements}개의 게임`
                  : "게임 목록을 불러오는 중..."}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="bg-[#252833] text-gray-200 px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="">모든 상태</option>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>

              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => handleFilterChange("platform", e.target.value)}
                className="bg-[#252833] text-gray-200 px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              >
                <option value="">모든 플랫폼</option>
                {PLATFORM_OPTIONS.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {(statusFilter || platformFilter) && (
                <button
                  onClick={() => router.push("/library")}
                  className="text-red-400 hover:text-red-300 text-sm font-medium px-3"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-40 animate-pulse">
            <p className="font-bold text-gray-500 text-sm italic uppercase tracking-widest">
              Loading Games...
            </p>
          </div>
        ) : games.length === 0 ? (
          /* Empty State */
          <div className="text-center py-32 bg-[#252833] rounded-[2rem] border border-dashed border-gray-700">
            <div className="text-6xl mb-6">🎮</div>
            <p className="text-gray-400 font-medium text-lg mb-2">
              라이브러리가 비어있습니다
            </p>
            <p className="text-gray-600 text-sm mb-8">
              게임 상세 페이지에서 라이브러리에 추가해보세요!
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all active:scale-95"
            >
              게임 찾아보기
            </Link>
          </div>
        ) : (
          /* Game Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <LibraryGameCard
                key={game.id}
                game={game}
                onEdit={() => openEditModal(game)}
                onDelete={() => setDeletingGame(game)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`w-11 h-11 rounded-xl font-bold transition-all ${
                  currentPage === i
                    ? "bg-blue-600 text-white"
                    : "bg-[#252833] text-gray-500 hover:text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e2330] rounded-3xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              게임 정보 수정
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {editingGame.gameName || `Game #${editingGame.gameId}`}
            </p>

            <div className="space-y-5">
              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  플랫폼
                </label>
                <select
                  value={editForm.platform || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, platform: e.target.value })
                  }
                  className="w-full bg-[#252833] text-gray-200 px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all"
                >
                  {PLATFORM_OPTIONS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Playtime */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  플레이 시간 (시간)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editForm.playtime || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      playtime: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#252833] text-gray-200 px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  상태
                </label>
                <select
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as StatusEnum,
                    })
                  }
                  className="w-full bg-[#252833] text-gray-200 px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all"
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Favorite */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={editForm.isFavorite || false}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isFavorite: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-[#252833] border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="favorite" className="text-gray-300 font-medium">
                  즐겨찾기에 추가
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingGame(null)}
                className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editPending}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {editPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e2330] rounded-3xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">게임 삭제</h2>
            <p className="text-gray-400 mb-8">
              <span className="text-white font-medium">
                {deletingGame.gameName || `Game #${deletingGame.gameId}`}
              </span>
              를 라이브러리에서 삭제하시겠습니까?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingGame(null)}
                className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deletePending}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-500 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {deletePending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Library Game Card Component
function LibraryGameCard({
  game,
  onEdit,
  onDelete,
}: {
  game: MemberGameDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusConfig = STATUS_CONFIG[game.status] || {
    label: game.status || "Unknown",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10 border-gray-500/30",
  };
  const coverUrl = game.coverImageId
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.jpg`
    : null;

  return (
    <div className="group bg-[#252833] rounded-2xl overflow-hidden border border-transparent hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
      {/* Cover Image */}
      <Link
        href={`/games/${game.igdbId}`}
        className="block relative aspect-[3/4] overflow-hidden"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.gameName || "Game cover"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}

        {/* Favorite Badge */}
        {game.isFavorite && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-black p-2 rounded-full shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {/* Rating Badge */}
        {game.rating !== null && (
          <div
            className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg ${
              game.rating >= 8
                ? "bg-green-500 text-white"
                : game.rating >= 5
                  ? "bg-yellow-500 text-black"
                  : "bg-red-500 text-white"
            }`}
          >
            {game.rating.toFixed(1)}
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.bgColor} ${statusConfig.color}`}
        >
          {statusConfig.label}
        </div>
      </Link>

      {/* Game Info */}
      <div className="p-4">
        <Link href={`/games/${game.igdbId}`}>
          <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-blue-400 transition-colors">
            {game.gameName || `Game #${game.gameId}`}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="bg-gray-800 px-2 py-1 rounded-md">
            {game.platform}
          </span>
          <span>{game.playtime.toFixed(1)}시간</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-xl text-sm font-medium hover:bg-gray-600 hover:text-white transition-all"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
