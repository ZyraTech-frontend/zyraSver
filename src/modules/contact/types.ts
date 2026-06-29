// Contact Module - Type Definitions

export interface CreateContactInquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  inquiryType?: string;
  message: string;
}

export interface ContactInquiryResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  inquiryType: string | null;
  message: string;
  status: string; // new | read | replied
  createdAt: string;
  updatedAt: string;
}

export class ContactError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ContactError';
  }
}
