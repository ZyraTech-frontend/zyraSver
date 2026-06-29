// Training Applications Module - Type Definitions
// Student enrollment form — no account created

export interface TrainingApplicationInput {
  courseId: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  country: string;
  currentLocation: string;
  educationLevel: string;
  preferredCohort: string;
  learningMode: string;
  message?: string;
  // Advanced course fields
  cvFileUrl?: string;
  motivationStatement?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export interface ApplicationResponse {
  applicationId: string;
  courseTitle: string;
  applicantName: string;
  status: string;
  submittedAt: string;
  message: string;
}

export interface EnrollmentListItem {
  id: string;
  applicationId: string;
  courseTitle: string;
  courseCategory: string;
  applicantName: string;
  emailAddress: string;
  phoneNumber: string;
  learningMode: string;
  status: string;
  submittedAt: string;
}

export interface EnrollmentDetail extends EnrollmentListItem {
  country: string;
  currentLocation: string;
  educationLevel: string;
  preferredCohort: string;
  message?: string | null;
  cvFileUrl?: string | null;
  motivationStatement?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
}

export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
