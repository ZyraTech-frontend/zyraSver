// Messages Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateMessageInput,
  MessageResponse,
  MessageError,
} from './types';

export class MessagesService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(message: any): MessageResponse {
    return {
      id: message.id,
      sender: message.sender,
      email: message.email,
      subject: message.subject,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }

  // ─── Submit Message ───────────────────────────────────────────

  static async submitMessage(input: CreateMessageInput): Promise<MessageResponse> {
    const message = await prisma.message.create({
      data: {
        sender: input.sender,
        email: input.email,
        subject: input.subject,
        content: input.content,
      },
    });

    return this.format(message);
  }

  // ─── Admin: List Messages ─────────────────────────────────────

  static async listMessages(
    page: number = 1,
    limit: number = 50,
    isRead?: boolean,
    search?: string
  ): Promise<{ messages: MessageResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (isRead !== undefined) where.isRead = isRead;
    if (search) {
      where.OR = [
        { sender: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, messages] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      messages: messages.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Admin: Get & Mark Read ───────────────────────────────────

  static async getMessage(id: string): Promise<MessageResponse> {
    let message = await prisma.message.findUnique({ where: { id } });
    if (!message) throw new MessageError(404, 'Message not found', 'NOT_FOUND');

    if (!message.isRead) {
      message = await prisma.message.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return this.format(message);
  }

  // ─── Admin: Update Read Status ────────────────────────────────

  static async updateReadStatus(id: string, isRead: boolean): Promise<MessageResponse> {
    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) throw new MessageError(404, 'Message not found', 'NOT_FOUND');

    const updated = await prisma.message.update({
      where: { id },
      data: { isRead },
    });

    return this.format(updated);
  }

  // ─── Admin: Delete Message ────────────────────────────────────

  static async deleteMessage(id: string): Promise<void> {
    const existing = await prisma.message.findUnique({ where: { id } });
    if (!existing) throw new MessageError(404, 'Message not found', 'NOT_FOUND');

    await prisma.message.delete({ where: { id } });
  }
}
