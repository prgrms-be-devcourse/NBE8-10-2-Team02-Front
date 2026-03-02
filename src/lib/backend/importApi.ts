import { apiFetch } from "./client";
import type { RsData } from "./types";
import type {
  ImportMatchRequest,
  ImportJobStatus,
  ImportConfirmRequest,
  ImportConfirmResponse,
} from "@/type/importTypes";

/** Start an async game name matching job */
export function startImportMatch(
  memberId: number,
  request: ImportMatchRequest
) {
  return apiFetch<RsData<{ jobId: string }>>(
    `/api/v1/members/${memberId}/library/import/match`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  ).then((r) => r.data);
}

/** Poll the status of a matching job */
export function pollImportJob(memberId: number, jobId: string) {
  return apiFetch<RsData<ImportJobStatus>>(
    `/api/v1/members/${memberId}/library/import/match/${jobId}`
  ).then((r) => r.data);
}

/** Confirm and bulk-add matched games to library */
export function confirmImport(
  memberId: number,
  request: ImportConfirmRequest
) {
  return apiFetch<RsData<ImportConfirmResponse>>(
    `/api/v1/members/${memberId}/library/import/confirm`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  ).then((r) => r.data);
}
