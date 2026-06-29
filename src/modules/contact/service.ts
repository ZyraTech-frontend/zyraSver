// Contact Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateContactInquiryInput,
  ContactInquiryResponse,
  ContactError,
} from './types';

export class ContactService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(inquiry: any): ContactInquiryResponse {
    return {
      id: inquiry.id,
      fullName: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
      inquiryType: inquiry.inquiryType,
      message: inquiry.message,
      status: inquiry.status,
      createdAt: inquiry.createdAt.toISOString(),
      updatedAt: inquiry.updatedAt.toISOString(),
    };
  }

  // ─── Submit Inquiry ───────────────────────────────────────────

  static async submitInquiry(input: CreateContactInquiryInput): Promise<ContactInquiryResponse> {
    const inquiry = await prisma.contactInquiry.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        inquiryType: input.inquiryType,
        message: input.message,
        status: 'new',
      },
    });

    return this.format(inquiry);
  }

  // ─── Admin: List Inquiries ────────────────────────────────────

  static async listInquiries(
    page: number = 1,
    limit: number = 50,
    status?: string,
    search?: string
  ): Promise<{ inquiries: ContactInquiryResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, inquiries] = await Promise.all([
      prisma.contactInquiry.count({ where }),
      prisma.contactInquiry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      inquiries: inquiries.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Admin: Get Inquiry ───────────────────────────────────────

  static async getInquiry(id: string): Promise<ContactInquiryResponse> {
    const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new ContactError(404, 'Inquiry not found', 'NOT_FOUND');
    return this.format(inquiry);
  }

  // ─── Admin: Update Status ─────────────────────────────────────

  static async updateStatus(id: string, status: string): Promise<ContactInquiryResponse> {
    if (!['new', 'read', 'replied'].includes(status)) {
      throw new ContactError(400, 'Invalid status', 'VALIDATION_ERROR');
    }

    const existing = await prisma.contactInquiry.findUnique({ where: { id } });
    if (!existing) throw new ContactError(404, 'Inquiry not found', 'NOT_FOUND');

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });

    return this.format(updated);
  }

  // ─── Admin: Delete Inquiry ────────────────────────────────────

  static async deleteInquiry(id: string): Promise<void> {
    const existing = await prisma.contactInquiry.findUnique({ where: { id } });
    if (!existing) throw new ContactError(404, 'Inquiry not found', 'NOT_FOUND');

    await prisma.contactInquiry.delete({ where: { id } });
  }
}
