// CMS Content Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateContentItemInput,
  UpdateContentItemInput,
  UpsertContentPageInput,
  ContentItemResponse,
  ContentPageResponse,
  ContentError,
} from './types';

export class ContentService {
  // ─── Formatting ───────────────────────────────────────────────

  private static formatItem(item: any): ContentItemResponse {
    let parsedContent = null;
    if (item.content) {
      try {
        parsedContent = JSON.parse(item.content);
      } catch {
        parsedContent = item.content;
      }
    }

    return {
      id: item.id,
      section: item.section,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      imageUrl: item.imageUrl,
      ctaText: item.ctaText,
      ctaLink: item.ctaLink,
      content: parsedContent,
      order: item.order,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private static formatPage(page: any): ContentPageResponse {
    let parsedContent = null;
    try {
      parsedContent = JSON.parse(page.content);
    } catch {
      parsedContent = page.content;
    }

    return {
      id: page.id,
      section: page.section,
      content: parsedContent,
      updatedAt: page.updatedAt.toISOString(),
    };
  }

  // ─── Content Items (List-based CMS) ─────────────────────────

  static async listContentItems(section: string, status?: string): Promise<ContentItemResponse[]> {
    const where: any = { section };
    if (status) where.status = status;

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return items.map(this.formatItem);
  }

  static async getContentItem(id: string): Promise<ContentItemResponse> {
    const item = await prisma.contentItem.findUnique({ where: { id } });
    if (!item) throw new ContentError(404, 'Content item not found', 'NOT_FOUND');
    return this.formatItem(item);
  }

  static async createContentItem(input: CreateContentItemInput): Promise<ContentItemResponse> {
    const item = await prisma.contentItem.create({
      data: {
        section: input.section,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        imageUrl: input.imageUrl,
        ctaText: input.ctaText,
        ctaLink: input.ctaLink,
        content: input.content,
        order: input.order ?? 0,
        status: input.status ?? 'published',
      },
    });
    return this.formatItem(item);
  }

  static async updateContentItem(id: string, input: UpdateContentItemInput): Promise<ContentItemResponse> {
    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) throw new ContentError(404, 'Content item not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.ctaText !== undefined) updateData.ctaText = input.ctaText;
    if (input.ctaLink !== undefined) updateData.ctaLink = input.ctaLink;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.order !== undefined) updateData.order = input.order;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await prisma.contentItem.update({
      where: { id },
      data: updateData,
    });
    return this.formatItem(updated);
  }

  static async deleteContentItem(id: string): Promise<void> {
    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) throw new ContentError(404, 'Content item not found', 'NOT_FOUND');

    await prisma.contentItem.delete({ where: { id } });
  }

  static async reorderContentItems(section: string, orderedIds: string[]): Promise<void> {
    // Process sequentially to avoid deadlocks
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.contentItem.updateMany({
        where: { id: orderedIds[i], section },
        data: { order: i },
      });
    }
  }

  // ─── Content Pages (Single Page CMS) ────────────────────────

  static async getContentPage(section: string): Promise<ContentPageResponse> {
    const page = await prisma.contentPage.findUnique({ where: { section } });
    if (!page) {
      // Return empty defaults if not yet created
      return {
        id: '',
        section,
        content: {},
        updatedAt: new Date().toISOString(),
      };
    }
    return this.formatPage(page);
  }

  static async upsertContentPage(input: UpsertContentPageInput, userId?: string): Promise<ContentPageResponse> {
    const stringifiedContent = typeof input.content === 'string' ? input.content : JSON.stringify(input.content);

    const page = await prisma.contentPage.upsert({
      where: { section: input.section },
      create: {
        section: input.section,
        content: stringifiedContent,
        updatedBy: userId,
      },
      update: {
        content: stringifiedContent,
        updatedBy: userId,
      },
    });

    return this.formatPage(page);
  }
}
