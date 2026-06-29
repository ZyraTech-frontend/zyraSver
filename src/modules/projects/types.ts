// Projects Module - Type Definitions

export interface CreateProjectInput {
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  technologies?: string[];
  clientName?: string;
  status?: string; // ContentStatus
  completedAt?: string | Date;
}

export interface UpdateProjectInput {
  title?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  technologies?: string[];
  clientName?: string;
  status?: string;
  completedAt?: string | Date;
}

export interface ProjectResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  technologies: string[];
  clientName: string | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class ProjectError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ProjectError';
  }
}
