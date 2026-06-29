// Gallery Module - Type Definitions

export interface CreateGalleryAlbumInput {
  title: string;
  description?: string;
  coverImageUrl?: string;
  status?: string; // ContentStatus
}

export interface UpdateGalleryAlbumInput {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  status?: string;
}

export interface CreateGalleryMediaInput {
  albumId: string;
  title?: string;
  url: string;
  type?: string; // image | video
  order?: number;
}

export interface UpdateGalleryMediaInput {
  title?: string;
  url?: string;
  type?: string;
  order?: number;
}

export interface GalleryMediaResponse {
  id: string;
  albumId: string;
  title: string | null;
  url: string;
  type: string;
  order: number;
  createdAt: string;
}

export interface GalleryAlbumResponse {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  media?: GalleryMediaResponse[];
  createdAt: string;
  updatedAt: string;
}

export class GalleryError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'GalleryError';
  }
}
