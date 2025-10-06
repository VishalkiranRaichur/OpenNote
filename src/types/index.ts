export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'pdf' | 'image';
  tags: string[];
  subject: string;
  isPublic: boolean;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  fileUrl?: string;
  fileSize?: number;
  fileName?: string;
  viewCount: number;
  likeCount: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  subject?: string;
  authorId?: string;
  isPublic?: boolean;
  sortBy?: 'recent' | 'popular' | 'title';
}
