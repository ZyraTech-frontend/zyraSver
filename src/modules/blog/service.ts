// Blog Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateBlogArticleInput,
  UpdateBlogArticleInput,
  BlogArticleResponse,
  BlogError,
} from './types';
import { ContentStatus } from '@prisma/client';

export class BlogService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(article: any): BlogArticleResponse {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      coverImageUrl: article.coverImageUrl,
      author: article.author,
      tags: article.tags || [],
      status: article.status,
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  // ─── List Articles ────────────────────────────────────────────

  static async listArticles(
    page: number = 1,
    limit: number = 20,
    status?: string,
    tag?: string,
    search?: string
  ): Promise<{ articles: BlogArticleResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (tag) {
      where.tags = { has: tag };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.blogArticle.count({ where }),
      prisma.blogArticle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: status === 'published' ? { publishedAt: 'desc' } : { createdAt: 'desc' },
      }),
    ]);

    return {
      articles: articles.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Get Single Article ───────────────────────────────────────

  static async getArticle(idOrSlug: string): Promise<BlogArticleResponse> {
    const article = await prisma.blogArticle.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });

    if (!article) throw new BlogError(404, 'Article not found', 'NOT_FOUND');
    return this.format(article);
  }

  // ─── Create Article ───────────────────────────────────────────

  static async createArticle(input: CreateBlogArticleInput): Promise<BlogArticleResponse> {
    // Check if slug is unique
    const existing = await prisma.blogArticle.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new BlogError(400, 'Slug already exists. Please choose a unique slug.', 'SLUG_EXISTS');
    }

    const article = await prisma.blogArticle.create({
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        coverImageUrl: input.coverImageUrl,
        author: input.author,
        tags: input.tags || [],
        status: (input.status as ContentStatus) || 'draft',
        publishedAt: input.status === 'published' ? new Date() : null,
      },
    });

    return this.format(article);
  }

  // ─── Update Article ───────────────────────────────────────────

  static async updateArticle(id: string, input: UpdateBlogArticleInput): Promise<BlogArticleResponse> {
    const existing = await prisma.blogArticle.findUnique({ where: { id } });
    if (!existing) throw new BlogError(404, 'Article not found', 'NOT_FOUND');

    // Check slug uniqueness if it's being updated
    if (input.slug && input.slug !== existing.slug) {
      const slugExists = await prisma.blogArticle.findUnique({ where: { slug: input.slug } });
      if (slugExists) {
        throw new BlogError(400, 'Slug already exists. Please choose a unique slug.', 'SLUG_EXISTS');
      }
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.tags !== undefined) updateData.tags = input.tags;
    
    if (input.status !== undefined) {
      updateData.status = input.status;
      // If status is changing to published and it wasn't before, set publishedAt
      if (input.status === 'published' && existing.status !== 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (input.publishedAt !== undefined) {
      updateData.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
    }

    const article = await prisma.blogArticle.update({
      where: { id },
      data: updateData,
    });

    return this.format(article);
  }

  // ─── Delete Article ───────────────────────────────────────────

  static async deleteArticle(id: string): Promise<void> {
    const existing = await prisma.blogArticle.findUnique({ where: { id } });
    if (!existing) throw new BlogError(404, 'Article not found', 'NOT_FOUND');

    await prisma.blogArticle.delete({ where: { id } });
  }
}
