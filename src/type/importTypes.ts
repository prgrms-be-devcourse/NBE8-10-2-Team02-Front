export type ImportMatchRequest = {
  gameNames: string[];
  sourcePlatform: string;
};

export type AlternativeMatch = {
  igdbId: number;
  name: string;
  coverImageId: string | null;
};

export type ImportMatchCandidate = {
  originalName: string;
  igdbId: number | null;
  matchedName: string | null;
  coverImageId: string | null;
  confidence: number;
  alreadyInLibrary: boolean;
  suggestedPlatform: string;
  alternatives: AlternativeMatch[];
};

export type ImportMatchResponse = {
  matches: ImportMatchCandidate[];
  totalRequested: number;
  totalMatched: number;
  totalAlreadyInLibrary: number;
};

export type ImportJobStatus = {
  jobId: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  processed: number;
  total: number;
  result: ImportMatchResponse | null;
};

export type ImportGameItem = {
  igdbId: number;
  platform: string;
};

export type ImportConfirmRequest = {
  games: ImportGameItem[];
};

export type ImportResultItem = {
  igdbId: number;
  gameName: string | null;
  status: "ADDED" | "DUPLICATE" | "ERROR";
};

export type ImportConfirmResponse = {
  totalAdded: number;
  totalSkippedDuplicate: number;
  totalFailed: number;
  results: ImportResultItem[];
};
