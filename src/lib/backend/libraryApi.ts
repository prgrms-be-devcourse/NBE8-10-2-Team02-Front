import { apiFetch } from "./client";
import type { RsData } from "./types";
import type {
  MemberGameDto,
  MemberGameAddRequest,
  MemberGameUpdateRequest,
  LibraryPageResponse,
  StatusEnum,
} from "@/type/libraryTypes";

/** Get user's library (paginated) */
export function getLibrary(
  memberId: number,
  page = 0,
  size = 20,
  status?: StatusEnum,
  platform?: string
) {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (status) params.append("status", status);
  if (platform) params.append("platform", platform);

  return apiFetch<RsData<LibraryPageResponse>>(
    `/api/v1/members/${memberId}/library?${params.toString()}`
  ).then((r) => r.data);
}

/** Add a game to library */
export function addToLibrary(memberId: number, request: MemberGameAddRequest) {
  return apiFetch<RsData<MemberGameDto>>(
    `/api/v1/members/${memberId}/library`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  ).then((r) => r.data);
}

/** Update a game in library */
export function updateLibraryGame(
  memberId: number,
  memberGameId: number,
  request: MemberGameUpdateRequest
) {
  return apiFetch<RsData<MemberGameDto>>(
    `/api/v1/members/${memberId}/library/${memberGameId}`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    }
  ).then((r) => r.data);
}

/** Remove a game from library */
export function removeFromLibrary(memberId: number, memberGameId: number) {
  return apiFetch<RsData<void>>(
    `/api/v1/members/${memberId}/library/${memberGameId}`,
    {
      method: "DELETE",
    }
  );
}
