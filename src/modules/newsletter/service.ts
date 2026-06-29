// Newsletter Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  SubscribeNewsletterInput,
  NewsletterSubscriberResponse,
  NewsletterError,
} from './types';

export class NewsletterService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(subscriber: any): NewsletterSubscriberResponse {
    return {
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
      status: subscriber.status,
      createdAt: subscriber.createdAt.toISOString(),
      updatedAt: subscriber.updatedAt.toISOString(),
    };
  }

  // ─── Subscribe ────────────────────────────────────────────────

  static async subscribe(input: SubscribeNewsletterInput): Promise<NewsletterSubscriberResponse> {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      if (existing.status === 'subscribed') {
        throw new NewsletterError(400, 'Email is already subscribed', 'ALREADY_SUBSCRIBED');
      } else {
        // Resubscribe them
        const updated = await prisma.newsletterSubscriber.update({
          where: { email: input.email },
          data: { status: 'subscribed', name: input.name || existing.name },
        });
        return this.format(updated);
      }
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: input.email,
        name: input.name,
        status: 'subscribed',
      },
    });

    return this.format(subscriber);
  }

  // ─── Unsubscribe ──────────────────────────────────────────────

  static async unsubscribe(email: string): Promise<void> {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!existing) {
      // Don't throw error to prevent email enumeration, just return
      return;
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { status: 'unsubscribed' },
    });
  }

  // ─── Admin: List Subscribers ──────────────────────────────────

  static async listSubscribers(
    page: number = 1,
    limit: number = 50,
    status?: string,
    search?: string
  ): Promise<{ subscribers: NewsletterSubscriberResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, subscribers] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      subscribers: subscribers.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Admin: Update Subscriber ─────────────────────────────────

  static async updateSubscriberStatus(id: string, status: string): Promise<NewsletterSubscriberResponse> {
    if (!['subscribed', 'unsubscribed'].includes(status)) {
      throw new NewsletterError(400, 'Invalid status', 'VALIDATION_ERROR');
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) throw new NewsletterError(404, 'Subscriber not found', 'NOT_FOUND');

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status },
    });

    return this.format(updated);
  }
}
