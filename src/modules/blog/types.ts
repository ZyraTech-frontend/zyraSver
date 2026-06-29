// Blog Module - Type Definitions

export interface CreateBlogArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  author?: string;
  tags?: string[];
  status?: string; // ContentStatus (published, draft, archived)
}

export interface UpdateBlogArticleInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImageUrl?: string;
  author?: string;
  tags?: string[];
  status?: string;
  publishedAt?: string | Date;
}

export interface BlogArticleResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: string | null;
  tags: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class BlogError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'BlogError';
  }
}
