// Training Courses Module - Type Definitions

export interface CreateCourseInput {
  title: string;
  category: 'basic' | 'intermediate' | 'advanced' | 'internship' | 'matured';
  duration: string;
  level: string;
  price: string;
  description?: string;
  topics?: string[];
  instructor?: string;
  format?: string;
}

export interface UpdateCourseInput {
  title?: string;
  category?: string;
  duration?: string;
  level?: string;
  price?: string;
  description?: string;
  topics?: string[];
  instructor?: string;
  format?: string;
  status?: 'active' | 'draft' | 'archived';
}

export interface CourseResponse {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  price: string;
  description?: string | null;
  topics: string[];
  instructor?: string | null;
  format?: string | null;
  status: string;
  enrollments: number; // maps to enrollmentCount
  createdAt: string;
  updatedAt: string;
}

export class CourseError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'CourseError';
  }
}
