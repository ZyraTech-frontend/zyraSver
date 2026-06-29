// Impact Module - Type Definitions

export interface CreateImpactMetricInput {
  label: string;
  value: string;
  suffix?: string;
  description?: string;
  order?: number;
}

export interface UpdateImpactMetricInput {
  label?: string;
  value?: string;
  suffix?: string;
  description?: string;
  order?: number;
}

export interface CreateImpactStoryInput {
  title: string;
  description: string;
  personName?: string;
  personRole?: string;
  imageUrl?: string;
  status?: string; // ContentStatus
}

export interface UpdateImpactStoryInput {
  title?: string;
  description?: string;
  personName?: string;
  personRole?: string;
  imageUrl?: string;
  status?: string;
}

export interface ImpactMetricResponse {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImpactStoryResponse {
  id: string;
  title: string;
  description: string;
  personName: string | null;
  personRole: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class ImpactError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ImpactError';
  }
}
