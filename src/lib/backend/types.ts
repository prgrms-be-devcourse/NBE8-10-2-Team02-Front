export type RsData<T> = {
  resultCode: string;
  msg: string;
  data: T;
};

export function pickMsg(err: any, fallback = "요청 처리 중 오류가 발생했습니다.") {
  return err?.msg || err?.message || fallback;
}
