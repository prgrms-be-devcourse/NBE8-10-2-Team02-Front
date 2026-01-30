// types/post.ts
export interface PostListItem {
  id: number;
  title: string;
  author: string;
  createDate: string;
  viewCount: number;
  tags: string[];
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}