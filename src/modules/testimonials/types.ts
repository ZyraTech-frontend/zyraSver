// Testimonials Module - Type Definitions

export interface CreateTestimonialInput {
  name: string;
  role?: string;
  organization?: string;
  content: string;
  avatarUrl?: string;
  rating?: number;
  isFeatured?: boolean;
  status?: string; // ContentStatus
}

export interface UpdateTestimonialInput {
  name?: string;
  role?: string;
  organization?: string;
  content?: string;
  avatarUrl?: string;
  rating?: number;
  isFeatured?: boolean;
  status?: string;
}

export interface TestimonialResponse {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  content: string;
  avatarUrl: string | null;
  rating: number | null;
  isFeatured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class TestimonialError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'TestimonialError';
  }
}
