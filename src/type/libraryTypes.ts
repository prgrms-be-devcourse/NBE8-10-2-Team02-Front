// Library feature types

export type StatusEnum =
  | "PLAYING"
  | "COMPLETED"
  | "DROPPED"
  | "ON_HOLD"
  | "PLAN_TO_PLAY";

export type MemberGameDto = {
  id: number;           // memberGameId - needed for update/delete
  platform: string;
  playtime: number;
  isFavorite: boolean;
  status: StatusEnum;
  gameId: number;
  igdbId: number;
  gameName: string;     // game name for display
  coverImageId: string | null; // actually coverImageId from IGDB
  reviewId: number | null;
  rating: number | null;
};

export type MemberGameAddRequest = {
  platform: string;
  playtime: number;
  isFavorite: boolean;
  status: StatusEnum;
  gameId: number;
};

export type MemberGameUpdateRequest = {
  platform?: string;
  playtime?: number;
  isFavorite?: boolean;
  status?: StatusEnum;
};

export type LibraryPageResponse = {
  content: MemberGameDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
};

// Status display configuration
export const STATUS_CONFIG: Record<StatusEnum, { label: string; color: string; bgColor: string }> = {
  PLAYING: {
    label: "플레이 중",
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/30"
  },
  COMPLETED: {
    label: "완료",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/30"
  },
  DROPPED: {
    label: "중단",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/30"
  },
  ON_HOLD: {
    label: "보류",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/30"
  },
  PLAN_TO_PLAY: {
    label: "플레이 예정",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/30"
  },
};

export const PLATFORM_OPTIONS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Mobile",
  "Other",
];