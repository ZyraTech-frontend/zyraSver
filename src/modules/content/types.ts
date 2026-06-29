// CMS Content Module - Type Definitions

// ─── Content Items (List items like Hero Slides, Services) ────

export interface CreateContentItemInput {
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string; // JSON string
  order?: number;
  status?: string;
}

export interface UpdateContentItemInput {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  content?: string; // JSON string
  order?: number;
  status?: string;
}

export interface ContentItemResponse {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  content: any; // Parsed JSON
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Content Pages (Single pages like About, Quality) ─────────

export interface UpsertContentPageInput {
  section: string;
  content: string; // JSON string with full page data
}

export interface ContentPageResponse {
  id: string;
  section: string;
  content: any; // Parsed JSON
  updatedAt: string;
}

export class ContentError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ContentError';
  }
}
