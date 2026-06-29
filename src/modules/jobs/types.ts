// Jobs Module - Type Definitions

// ─── Job Listings ──────────────────────────────────────────────

export interface CreateJobInput {
  title: string;
  department?: string;
  location?: string;
  type?: string;
  level?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary?: string;
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  level?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary?: string;
  status?: 'active' | 'draft' | 'closed';
}

export interface JobResponse {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string | null;
  level: string | null;
  description: string | null;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Job Applications ──────────────────────────────────────────

export interface SubmitJobApplicationInput {
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  phoneNumber: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  resumeUrl: string;
  message: string;
  title?: string;
  legalAuthorization: string;
  workExperience: number;
  residence: string;
  currentSalary: string;
  howDidYouKnowZyra: string;
  additionalDocumentUrl?: string;
  disability?: string;
  references?: string;
  howDidYouKnowJob?: string;
  backgroundCheck?: string;
  criminalCharges?: string;
  certifyTruth: boolean;
  agreePrivacy: boolean;
}

export interface JobApplicationListItem {
  id: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phoneNumber: string;
  status: string;
  submittedAt: string;
}

export interface JobApplicationDetail extends JobApplicationListItem {
  city: string;
  linkedin: string | null;
  facebook: string | null;
  twitter: string | null;
  website: string | null;
  resumeUrl: string;
  message: string;
  title: string | null;
  legalAuthorization: string;
  workExperience: number;
  residence: string;
  currentSalary: string;
  howDidYouKnowZyra: string;
  additionalDocumentUrl: string | null;
  disability: string | null;
  references: string | null;
  howDidYouKnowJob: string | null;
  backgroundCheck: string | null;
  criminalCharges: string | null;
  certifyTruth: boolean;
  agreePrivacy: boolean;
  reviewNotes: string | null;
  reviewedAt: string | null;
}

export class JobError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'JobError';
  }
}
