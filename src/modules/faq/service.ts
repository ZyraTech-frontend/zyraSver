// FAQ Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateFAQInput,
  UpdateFAQInput,
  FAQResponse,
  FAQError,
} from './types';
import { ContentStatus } from '@prisma/client';

export class FAQService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(faq: any): FAQResponse {
    return {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      status: faq.status,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };
  }

  // ─── List FAQs ────────────────────────────────────────────────

  static async listFAQs(
    category?: string,
    status?: string
  ): Promise<FAQResponse[]> {
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    return faqs.map(this.format);
  }

  // ─── Get Single FAQ ───────────────────────────────────────────

  static async getFAQ(id: string): Promise<FAQResponse> {
    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) throw new FAQError(404, 'FAQ not found', 'NOT_FOUND');
    return this.format(faq);
  }

  // ─── Create FAQ ───────────────────────────────────────────────

  static async createFAQ(input: CreateFAQInput): Promise<FAQResponse> {
    const faq = await prisma.fAQ.create({
      data: {
        question: input.question,
        answer: input.answer,
        category: input.category,
        order: input.order ?? 0,
        status: (input.status as ContentStatus) || 'draft',
      },
    });

    return this.format(faq);
  }

  // ─── Update FAQ ───────────────────────────────────────────────

  static async updateFAQ(id: string, input: UpdateFAQInput): Promise<FAQResponse> {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new FAQError(404, 'FAQ not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.question !== undefined) updateData.question = input.question;
    if (input.answer !== undefined) updateData.answer = input.answer;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.order !== undefined) updateData.order = input.order;
    if (input.status !== undefined) updateData.status = input.status;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: updateData,
    });

    return this.format(faq);
  }

  // ─── Delete FAQ ───────────────────────────────────────────────

  static async deleteFAQ(id: string): Promise<void> {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new FAQError(404, 'FAQ not found', 'NOT_FOUND');

    await prisma.fAQ.delete({ where: { id } });
  }

  // ─── Reorder FAQs ─────────────────────────────────────────────

  static async reorderFAQs(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.fAQ.updateMany({
        where: { id: orderedIds[i] },
        data: { order: i },
      });
    }
  }
}
