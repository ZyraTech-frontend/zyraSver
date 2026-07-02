// Jobs Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateJobInput,
  UpdateJobInput,
  JobResponse,
  SubmitJobApplicationInput,
  JobApplicationListItem,
  JobApplicationDetail,
  JobError,
} from './types';

export class JobsService {
  // ─── Format Job Response ──────────────────────────────────────
  private static formatJob(job: any): JobResponse {
    return {
      id: job.id,
      title: job.title,
      department: job.department ?? null,
      location: job.location ?? null,
      type: job.type ?? null,
      level: job.level ?? null,
      description: job.description ?? null,
      requirements: job.requirements || [],
      responsibilities: job.responsibilities || [],
      benefits: job.benefits || [],
      salary: job.salary ?? null,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  // ─── JOB LISTINGS (CRUD) ──────────────────────────────────────

  static async listJobs(
    page: number = 1,
    limit: number = 10,
    status?: string,
    department?: string,
    search?: string
  ): Promise<{
    jobs: JobResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);

    const where: any = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, jobs] = await Promise.all([
      prisma.jobListing.count({ where }),
      prisma.jobListing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      jobs: jobs.map(this.formatJob),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async listPublicJobs(
    page: number = 1,
    limit: number = 20,
    department?: string
  ): Promise<{
    jobs: JobResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where: any = { status: 'active' };
    if (department) where.department = department;

    const [total, jobs] = await Promise.all([
      prisma.jobListing.count({ where }),
      prisma.jobListing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      jobs: jobs.map(this.formatJob),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getJobById(id: string): Promise<JobResponse> {
    const job = await prisma.jobListing.findUnique({ where: { id } });
    if (!job) throw new JobError(404, 'Job not found', 'NOT_FOUND');
    return this.formatJob(job);
  }

  static async createJob(input: CreateJobInput): Promise<JobResponse> {
    const job = await prisma.jobListing.create({
      data: {
        title: input.title,
        department: input.department,
        location: input.location,
        type: input.type,
        level: input.level,
        description: input.description,
        requirements: input.requirements || [],
        responsibilities: input.responsibilities || [],
        benefits: input.benefits || [],
        salary: input.salary,
        status: 'draft',
      },
    });
    return this.formatJob(job);
  }

  static async updateJob(id: string, input: UpdateJobInput): Promise<JobResponse> {
    const existing = await prisma.jobListing.findUnique({ where: { id } });
    if (!existing) throw new JobError(404, 'Job not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.level !== undefined) updateData.level = input.level;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.requirements !== undefined) updateData.requirements = input.requirements;
    if (input.responsibilities !== undefined) updateData.responsibilities = input.responsibilities;
    if (input.benefits !== undefined) updateData.benefits = input.benefits;
    if (input.salary !== undefined) updateData.salary = input.salary;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await prisma.jobListing.update({ where: { id }, data: updateData });
    return this.formatJob(updated);
  }

  static async deleteJob(id: string): Promise<void> {
    const existing = await prisma.jobListing.findUnique({ where: { id } });
    if (!existing) throw new JobError(404, 'Job not found', 'NOT_FOUND');

    const applicationCount = await prisma.jobApplication.count({
      where: { jobId: id, status: 'pending' },
    });
    if (applicationCount > 0) {
      throw new JobError(
        409,
        `Cannot delete job with ${applicationCount} pending application(s).`,
        'CONFLICT'
      );
    }

    await prisma.jobListing.delete({ where: { id } });
  }

  // ─── JOB APPLICATIONS ──────────────────────────────────────────

  static async submitApplication(input: SubmitJobApplicationInput): Promise<{ applicationId: string; message: string }> {
    const job = await prisma.jobListing.findUnique({ where: { id: input.jobId } });
    if (!job) throw new JobError(404, 'Job not found', 'NOT_FOUND');
    if (job.status !== 'active') {
      throw new JobError(400, 'Applications for this job are closed', 'JOB_NOT_ACTIVE');
    }

    const duplicate = await prisma.jobApplication.findFirst({
      where: {
        jobId: input.jobId,
        email: input.email.toLowerCase().trim(),
      },
    });
    if (duplicate) {
      throw new JobError(409, 'You have already applied for this role', 'CONFLICT');
    }

    const app = await prisma.jobApplication.create({
      data: {
        jobId: input.jobId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.toLowerCase().trim(),
        city: input.city,
        phoneNumber: input.phoneNumber,
        linkedin: input.linkedin,
        facebook: input.facebook,
        twitter: input.twitter,
        website: input.website,
        resumeUrl: input.resumeUrl,
        message: input.message,
        title: input.title,
        legalAuthorization: input.legalAuthorization,
        workExperience: input.workExperience,
        residence: input.residence,
        currentSalary: input.currentSalary,
        howDidYouKnowZyra: input.howDidYouKnowZyra,
        additionalDocumentUrl: input.additionalDocumentUrl,
        disability: input.disability,
        references: input.references,
        howDidYouKnowJob: input.howDidYouKnowJob,
        backgroundCheck: input.backgroundCheck,
        criminalCharges: input.criminalCharges,
        certifyTruth: input.certifyTruth,
        agreePrivacy: input.agreePrivacy,
        status: 'pending',
      },
    });

    return {
      applicationId: app.id,
      message: 'Application submitted successfully. We will review it shortly.',
    };
  }

  static async listApplications(
    page: number = 1,
    limit: number = 10,
    status?: string,
    jobId?: string
  ): Promise<{
    applications: JobApplicationListItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);

    const where: any = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const [total, applications] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { title: true } } },
      }),
    ]);

    return {
      applications: applications.map((app: any) => ({
        id: app.id,
        jobTitle: app.job.title,
        applicantName: `${app.firstName} ${app.lastName}`,
        email: app.email,
        phoneNumber: app.phoneNumber,
        status: app.status,
        submittedAt: app.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getApplicationById(id: string): Promise<JobApplicationDetail> {
    const app = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: { select: { title: true } } },
    });
    if (!app) throw new JobError(404, 'Application not found', 'NOT_FOUND');

    return {
      id: app.id,
      jobTitle: app.job.title,
      applicantName: `${app.firstName} ${app.lastName}`,
      email: app.email,
      phoneNumber: app.phoneNumber,
      status: app.status,
      submittedAt: app.createdAt.toISOString(),
      city: app.city,
      linkedin: app.linkedin,
      facebook: app.facebook,
      twitter: app.twitter,
      website: app.website,
      resumeUrl: app.resumeUrl,
      message: app.message,
      title: app.title,
      legalAuthorization: app.legalAuthorization,
      workExperience: app.workExperience,
      residence: app.residence,
      currentSalary: app.currentSalary,
      howDidYouKnowZyra: app.howDidYouKnowZyra,
      additionalDocumentUrl: app.additionalDocumentUrl,
      disability: app.disability,
      references: app.references,
      howDidYouKnowJob: app.howDidYouKnowJob,
      backgroundCheck: app.backgroundCheck,
      criminalCharges: app.criminalCharges,
      certifyTruth: app.certifyTruth,
      agreePrivacy: app.agreePrivacy,
      reviewNotes: app.reviewNotes,
      reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
    };
  }

  static async updateApplicationStatus(
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    reviewNotes?: string,
    reviewedBy?: string
  ): Promise<JobApplicationDetail> {
    const app = await prisma.jobApplication.findUnique({ where: { id } });
    if (!app) throw new JobError(404, 'Application not found', 'NOT_FOUND');

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
      },
      include: { job: { select: { title: true } } },
    });

    return this.getApplicationById(updated.id);
  }
}
