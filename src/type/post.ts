// types/post.ts
export interface PostListItem {
  id: number;
  title: string;
  author: string; // 장인호 (현재 백엔드 연동 필요)
  createDate: string;
  viewCount: number; // 조회수 (현재 백엔드 연동 필요)
  tags: string[];
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 현재 페이지 (0부터 시작)
  size: number;
}