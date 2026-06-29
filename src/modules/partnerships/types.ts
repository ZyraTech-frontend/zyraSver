// Partnerships Module - Type Definitions

export interface CreatePartnershipApplicationInput {
  // Organization Info
  organizationName: string;
  organizationType: string;
  website?: string;
  country: string;

  // Contact Details
  contactName: string;
  position: string;
  email: string;
  phone: string;

  // Partnership Goals
  partnershipType: string;
  interests?: string[];
  timeline?: string;
  message?: string;

  // Agreement
  agreedToTerms: boolean;
}

export interface PartnershipApplicationResponse {
  id: string;
  organizationName: string;
  organizationType: string;
  website: string | null;
  country: string;
  contactName: string;
  position: string;
  email: string;
  phone: string;
  partnershipType: string;
  interests: string[];
  timeline: string | null;
  message: string | null;
  agreedToTerms: boolean;
  status: string; // ApplicationStatus
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export class PartnershipError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'PartnershipError';
  }
}
