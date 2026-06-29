// FAQ Module - Type Definitions

export interface CreateFAQInput {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  status?: string; // ContentStatus
}

export interface UpdateFAQInput {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
  status?: string;
}

export interface FAQResponse {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class FAQError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'FAQError';
  }
}
