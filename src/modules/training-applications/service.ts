// Training Applications Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  TrainingApplicationInput,
  ApplicationResponse,
  EnrollmentListItem,
  EnrollmentDetail,
  ApplicationError,
} from './types';

// Valid enum values
const VALID_EDUCATION_LEVELS = ['JHS / SHS', 'Diploma', 'Undergraduate', 'Graduate', 'Other'];
const VALID_COHORTS = ['January to April', 'April to July', 'July to October'];
const VALID_LEARNING_MODES = ['Online', 'Onsite', 'Hybrid'];


export class TrainingApplicationsService {
  // ─── Generate Application ID ──────────────────────────────────
  private static async generateApplicationId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.trainingApplication.count();
    const padded = String(count + 1).padStart(6, '0');
    return `app_${year}_${padded}`;
  }

  // ─── Validate Application Input ───────────────────────────────
  static validateInput(
    body: any,
    isAdvanced: boolean,
    hasFile: boolean
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!body.courseId) errors.courseId = 'Course is required';
    if (!body.fullName?.trim()) errors.fullName = 'Full name is required';
    if (!body.emailAddress?.trim()) {
      errors.emailAddress = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.emailAddress)) {
      errors.emailAddress = 'Invalid email format';
    }
    if (!body.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
    if (!body.country?.trim()) errors.country = 'Country is required';
    if (!body.currentLocation?.trim()) errors.currentLocation = 'Current location is required';
    if (!body.educationLevel) {
      errors.educationLevel = 'Education level is required';
    } else if (!VALID_EDUCATION_LEVELS.includes(body.educationLevel)) {
      errors.educationLevel = `Must be one of: ${VALID_EDUCATION_LEVELS.join(', ')}`;
    }
    if (!body.preferredCohort) {
      errors.preferredCohort = 'Preferred cohort is required';
    } else if (!VALID_COHORTS.includes(body.preferredCohort)) {
      errors.preferredCohort = `Must be one of: ${VALID_COHORTS.join(', ')}`;
    }
    if (!body.learningMode) {
      errors.learningMode = 'Learning mode is required';
    } else if (!VALID_LEARNING_MODES.includes(body.learningMode)) {
      errors.learningMode = `Must be one of: ${VALID_LEARNING_MODES.join(', ')}`;
    }

    // Advanced course extra fields
    if (isAdvanced) {
      if (!hasFile) errors.cvFile = 'CV/Resume is required for this program level';
      if (!body.motivationStatement?.trim()) {
        errors.motivationStatement = 'Motivation statement is required for this program level';
      }
    }

    return errors;
  }

  // ─── Submit Application (Public) ─────────────────────────────
  static async submitApplication(
    input: TrainingApplicationInput
  ): Promise<ApplicationResponse> {
    // Verify course exists and is active
    const course = await prisma.trainingCourse.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new ApplicationError(404, 'Course not found', 'NOT_FOUND');
    }

    if (course.status !== 'active') {
      throw new ApplicationError(
        400,
        'Applications for this course are currently closed',
        'COURSE_NOT_ACTIVE'
      );
    }

    // Check for duplicate application (same email + course)
    const duplicate = await prisma.trainingApplication.findFirst({
      where: {
        courseId: input.courseId,
        emailAddress: input.emailAddress.toLowerCase().trim(),
        status: { not: 'rejected' }, // Allow re-apply if previously rejected
      },
    });

    if (duplicate) {
      throw new ApplicationError(
        409,
        'You have already applied for this course',
        'CONFLICT'
      );
    }

    const applicationId = await this.generateApplicationId();

    // Create application record
    await prisma.trainingApplication.create({
      data: {
        courseId: input.courseId,
        fullName: input.fullName.trim(),
        emailAddress: input.emailAddress.toLowerCase().trim(),
        phoneNumber: input.phoneNumber.trim(),
        country: input.country.trim(),
        currentLocation: input.currentLocation.trim(),
        educationLevel: input.educationLevel,
        preferredCohort: input.preferredCohort,
        learningMode: input.learningMode,
        message: input.message?.trim() || null,
        cvFileUrl: input.cvFileUrl || null,
        motivationStatement: input.motivationStatement?.trim() || null,
        linkedinUrl: input.linkedinUrl?.trim() || null,
        websiteUrl: input.websiteUrl?.trim() || null,
        status: 'pending',
      },
    });

    // Update course enrollment count
    await prisma.trainingCourse.update({
      where: { id: input.courseId },
      data: { enrollmentCount: { increment: 1 } },
    });

    return {
      applicationId,
      courseTitle: course.title,
      applicantName: input.fullName.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      message:
        'Application submitted successfully. We will review and contact you within 3-5 business days.',
    };
  }

  // ─── List All Applications (Admin) ────────────────────────────
  static async listApplications(
    page: number = 1,
    limit: number = 10,
    status?: string,
    courseId?: string
  ): Promise<{
    applications: EnrollmentListItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);

    const where: any = {};
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;

    const [total, applications] = await Promise.all([
      prisma.trainingApplication.count({ where }),
      prisma.trainingApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { title: true, category: true } } },
      }),
    ]);

    return {
      applications: applications.map((app) => ({
        id: app.id,
        applicationId: `app_${app.createdAt.getFullYear()}_${app.id.slice(-6)}`,
        courseTitle: app.course.title,
        courseCategory: app.course.category,
        applicantName: app.fullName,
        emailAddress: app.emailAddress,
        phoneNumber: app.phoneNumber,
        learningMode: app.learningMode,
        status: app.status,
        submittedAt: app.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get Single Application (Admin) ───────────────────────────
  static async getApplicationById(id: string): Promise<EnrollmentDetail> {
    const app = await prisma.trainingApplication.findUnique({
      where: { id },
      include: { course: { select: { title: true, category: true } } },
    });

    if (!app) throw new ApplicationError(404, 'Application not found', 'NOT_FOUND');

    return {
      id: app.id,
      applicationId: `app_${app.createdAt.getFullYear()}_${app.id.slice(-6)}`,
      courseTitle: app.course.title,
      courseCategory: app.course.category,
      applicantName: app.fullName,
      emailAddress: app.emailAddress,
      phoneNumber: app.phoneNumber,
      learningMode: app.learningMode,
      status: app.status,
      submittedAt: app.createdAt.toISOString(),
      country: app.country,
      currentLocation: app.currentLocation,
      educationLevel: app.educationLevel,
      preferredCohort: app.preferredCohort,
      message: app.message,
      cvFileUrl: app.cvFileUrl,
      motivationStatement: app.motivationStatement,
      linkedinUrl: app.linkedinUrl,
      websiteUrl: app.websiteUrl,
      reviewNotes: app.reviewNotes,
      reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : null,
    };
  }

  // ─── Update Application Status (Admin) ───────────────────────
  static async updateStatus(
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    reviewNotes?: string,
    reviewedBy?: string
  ): Promise<EnrollmentDetail> {
    const app = await prisma.trainingApplication.findUnique({ where: { id } });
    if (!app) throw new ApplicationError(404, 'Application not found', 'NOT_FOUND');

    const updated = await prisma.trainingApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        reviewedBy: reviewedBy || null,
        reviewedAt: new Date(),
      },
      include: { course: { select: { title: true, category: true } } },
    });

    // TODO: Send email/SMS notification to student when approved or rejected
    // This will be wired up once the Settings module is built (needs email config)

    return {
      id: updated.id,
      applicationId: `app_${updated.createdAt.getFullYear()}_${updated.id.slice(-6)}`,
      courseTitle: updated.course.title,
      courseCategory: updated.course.category,
      applicantName: updated.fullName,
      emailAddress: updated.emailAddress,
      phoneNumber: updated.phoneNumber,
      learningMode: updated.learningMode,
      status: updated.status,
      submittedAt: updated.createdAt.toISOString(),
      country: updated.country,
      currentLocation: updated.currentLocation,
      educationLevel: updated.educationLevel,
      preferredCohort: updated.preferredCohort,
      message: updated.message,
      cvFileUrl: updated.cvFileUrl,
      motivationStatement: updated.motivationStatement,
      linkedinUrl: updated.linkedinUrl,
      websiteUrl: updated.websiteUrl,
      reviewNotes: updated.reviewNotes,
      reviewedAt: updated.reviewedAt ? updated.reviewedAt.toISOString() : null,
    };
  }
}
