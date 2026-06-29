// Testimonials Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateTestimonialInput,
  UpdateTestimonialInput,
  TestimonialResponse,
  TestimonialError,
} from './types';
import { ContentStatus } from '@prisma/client';

export class TestimonialService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(testimonial: any): TestimonialResponse {
    return {
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      organization: testimonial.organization,
      content: testimonial.content,
      avatarUrl: testimonial.avatarUrl,
      rating: testimonial.rating,
      isFeatured: testimonial.isFeatured,
      status: testimonial.status,
      createdAt: testimonial.createdAt.toISOString(),
      updatedAt: testimonial.updatedAt.toISOString(),
    };
  }

  // ─── List Testimonials ────────────────────────────────────────

  static async listTestimonials(
    page: number = 1,
    limit: number = 20,
    status?: string,
    isFeatured?: boolean
  ): Promise<{ testimonials: TestimonialResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    const [total, testimonials] = await Promise.all([
      prisma.testimonial.count({ where }),
      prisma.testimonial.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      testimonials: testimonials.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Get Single Testimonial ───────────────────────────────────

  static async getTestimonial(id: string): Promise<TestimonialResponse> {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new TestimonialError(404, 'Testimonial not found', 'NOT_FOUND');
    return this.format(testimonial);
  }

  // ─── Create Testimonial ───────────────────────────────────────

  static async createTestimonial(input: CreateTestimonialInput): Promise<TestimonialResponse> {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: input.name,
        role: input.role,
        organization: input.organization,
        content: input.content,
        avatarUrl: input.avatarUrl,
        rating: input.rating,
        isFeatured: input.isFeatured ?? false,
        status: (input.status as ContentStatus) || 'draft',
      },
    });

    return this.format(testimonial);
  }

  // ─── Update Testimonial ───────────────────────────────────────

  static async updateTestimonial(id: string, input: UpdateTestimonialInput): Promise<TestimonialResponse> {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new TestimonialError(404, 'Testimonial not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.organization !== undefined) updateData.organization = input.organization;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
    if (input.rating !== undefined) updateData.rating = input.rating;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.status !== undefined) updateData.status = input.status;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return this.format(testimonial);
  }

  // ─── Delete Testimonial ───────────────────────────────────────

  static async deleteTestimonial(id: string): Promise<void> {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new TestimonialError(404, 'Testimonial not found', 'NOT_FOUND');

    await prisma.testimonial.delete({ where: { id } });
  }
}
