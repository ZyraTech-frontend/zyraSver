// Gallery Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateGalleryAlbumInput,
  UpdateGalleryAlbumInput,
  CreateGalleryMediaInput,
  UpdateGalleryMediaInput,
  GalleryAlbumResponse,
  GalleryMediaResponse,
  GalleryError,
} from './types';
import { ContentStatus } from '@prisma/client';

export class GalleryService {
  // ─── Format Response ──────────────────────────────────────────

  private static formatMedia(media: any): GalleryMediaResponse {
    return {
      id: media.id,
      albumId: media.albumId,
      title: media.title,
      url: media.url,
      type: media.type,
      order: media.order,
      createdAt: media.createdAt.toISOString(),
    };
  }

  private static formatAlbum(album: any): GalleryAlbumResponse {
    return {
      id: album.id,
      title: album.title,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      status: album.status,
      media: album.media ? album.media.map(this.formatMedia) : undefined,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString(),
    };
  }

  // ─── ALBUMS ───────────────────────────────────────────────────

  static async listAlbums(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ albums: GalleryAlbumResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [total, albums] = await Promise.all([
      prisma.galleryAlbum.count({ where }),
      prisma.galleryAlbum.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      albums: albums.map(this.formatAlbum),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  static async getAlbum(id: string, includeMedia = true): Promise<GalleryAlbumResponse> {
    const album = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: {
        media: includeMedia ? { orderBy: { order: 'asc' } } : false,
      },
    });

    if (!album) throw new GalleryError(404, 'Album not found', 'NOT_FOUND');
    return this.formatAlbum(album);
  }

  static async createAlbum(input: CreateGalleryAlbumInput): Promise<GalleryAlbumResponse> {
    const album = await prisma.galleryAlbum.create({
      data: {
        title: input.title,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        status: (input.status as ContentStatus) || 'draft',
      },
    });
    return this.formatAlbum(album);
  }

  static async updateAlbum(id: string, input: UpdateGalleryAlbumInput): Promise<GalleryAlbumResponse> {
    const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!existing) throw new GalleryError(404, 'Album not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl;
    if (input.status !== undefined) updateData.status = input.status;

    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: updateData,
    });
    return this.formatAlbum(album);
  }

  static async deleteAlbum(id: string): Promise<void> {
    const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!existing) throw new GalleryError(404, 'Album not found', 'NOT_FOUND');

    await prisma.galleryAlbum.delete({ where: { id } });
  }

  // ─── MEDIA ────────────────────────────────────────────────────

  static async addMediaToAlbum(input: CreateGalleryMediaInput): Promise<GalleryMediaResponse> {
    const album = await prisma.galleryAlbum.findUnique({ where: { id: input.albumId } });
    if (!album) throw new GalleryError(404, 'Album not found', 'NOT_FOUND');

    const media = await prisma.galleryMedia.create({
      data: {
        albumId: input.albumId,
        title: input.title,
        url: input.url,
        type: input.type || 'image',
        order: input.order ?? 0,
      },
    });

    return this.formatMedia(media);
  }

  static async updateMedia(id: string, input: UpdateGalleryMediaInput): Promise<GalleryMediaResponse> {
    const existing = await prisma.galleryMedia.findUnique({ where: { id } });
    if (!existing) throw new GalleryError(404, 'Media not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.url !== undefined) updateData.url = input.url;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.order !== undefined) updateData.order = input.order;

    const media = await prisma.galleryMedia.update({
      where: { id },
      data: updateData,
    });

    return this.formatMedia(media);
  }

  static async removeMedia(id: string): Promise<void> {
    const existing = await prisma.galleryMedia.findUnique({ where: { id } });
    if (!existing) throw new GalleryError(404, 'Media not found', 'NOT_FOUND');

    await prisma.galleryMedia.delete({ where: { id } });
  }

  static async reorderMedia(albumId: string, orderedIds: string[]): Promise<void> {
    const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
    if (!album) throw new GalleryError(404, 'Album not found', 'NOT_FOUND');

    // Sequential update to avoid deadlocks
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.galleryMedia.updateMany({
        where: { id: orderedIds[i], albumId },
        data: { order: i },
      });
    }
  }
}
