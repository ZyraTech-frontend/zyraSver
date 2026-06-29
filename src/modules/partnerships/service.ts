// Partnerships Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreatePartnershipApplicationInput,
  PartnershipApplicationResponse,
  PartnershipError,
} from './types';
import { ApplicationStatus } from '@prisma/client';

export class PartnershipsService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(application: any): PartnershipApplicationResponse {
    return {
      id: application.id,
      organizationName: application.organizationName,
      organizationType: application.organizationType,
      website: application.website,
      country: application.country,
      contactName: application.contactName,
      position: application.position,
      email: application.email,
      phone: application.phone,
      partnershipType: application.partnershipType,
      interests: application.interests || [],
      timeline: application.timeline,
      message: application.message,
      agreedToTerms: application.agreedToTerms,
      status: application.status,
      reviewedBy: application.reviewedBy,
      reviewedAt: application.reviewedAt ? application.reviewedAt.toISOString() : null,
      reviewNotes: application.reviewNotes,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    };
  }

  // ─── Submit Application ───────────────────────────────────────

  static async submitApplication(input: CreatePartnershipApplicationInput): Promise<PartnershipApplicationResponse> {
    if (!input.agreedToTerms) {
      throw new PartnershipError(400, 'Must agree to terms to submit application', 'VALIDATION_ERROR');
    }

    const application = await prisma.partnershipApplication.create({
      data: {
        organizationName: input.organizationName,
        organizationType: input.organizationType,
        website: input.website,
        country: input.country,
        contactName: input.contactName,
        position: input.position,
        email: input.email,
        phone: input.phone,
        partnershipType: input.partnershipType,
        interests: input.interests || [],
        timeline: input.timeline,
        message: input.message,
        agreedToTerms: input.agreedToTerms,
      },
    });

    return this.format(application);
  }

  // ─── Admin: List Applications ─────────────────────────────────

  static async listApplications(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ applications: PartnershipApplicationResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { organizationName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, applications] = await Promise.all([
      prisma.partnershipApplication.count({ where }),
      prisma.partnershipApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      applications: applications.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Admin: Get Application ───────────────────────────────────

  static async getApplication(id: string): Promise<PartnershipApplicationResponse> {
    const application = await prisma.partnershipApplication.findUnique({ where: { id } });
    if (!application) throw new PartnershipError(404, 'Application not found', 'NOT_FOUND');
    return this.format(application);
  }

  // ─── Admin: Update Status ─────────────────────────────────────

  static async updateStatus(
    id: string,
    status: string,
    reviewNotes: string | undefined,
    adminId: string
  ): Promise<PartnershipApplicationResponse> {
    const existing = await prisma.partnershipApplication.findUnique({ where: { id } });
    if (!existing) throw new PartnershipError(404, 'Application not found', 'NOT_FOUND');

    const updateData: any = {
      status: status as ApplicationStatus,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes;
    }

    const updated = await prisma.partnershipApplication.update({
      where: { id },
      data: updateData,
    });

    return this.format(updated);
  }

  // ─── Admin: Delete Application ────────────────────────────────

  static async deleteApplication(id: string): Promise<void> {
    const existing = await prisma.partnershipApplication.findUnique({ where: { id } });
    if (!existing) throw new PartnershipError(404, 'Application not found', 'NOT_FOUND');

    await prisma.partnershipApplication.delete({ where: { id } });
  }
}
