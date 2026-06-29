// Impact Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateImpactMetricInput,
  UpdateImpactMetricInput,
  CreateImpactStoryInput,
  UpdateImpactStoryInput,
  ImpactMetricResponse,
  ImpactStoryResponse,
  ImpactError,
} from './types';
import { ContentStatus } from '@prisma/client';

export class ImpactService {
  // ─── Format Response ──────────────────────────────────────────

  private static formatMetric(metric: any): ImpactMetricResponse {
    return {
      id: metric.id,
      label: metric.label,
      value: metric.value,
      suffix: metric.suffix,
      description: metric.description,
      order: metric.order,
      createdAt: metric.createdAt.toISOString(),
      updatedAt: metric.updatedAt.toISOString(),
    };
  }

  private static formatStory(story: any): ImpactStoryResponse {
    return {
      id: story.id,
      title: story.title,
      description: story.description,
      personName: story.personName,
      personRole: story.personRole,
      imageUrl: story.imageUrl,
      status: story.status,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    };
  }

  // ─── METRICS ──────────────────────────────────────────────────

  static async listMetrics(): Promise<ImpactMetricResponse[]> {
    const metrics = await prisma.impactMetric.findMany({
      orderBy: { order: 'asc' },
    });
    return metrics.map(this.formatMetric);
  }

  static async getMetric(id: string): Promise<ImpactMetricResponse> {
    const metric = await prisma.impactMetric.findUnique({ where: { id } });
    if (!metric) throw new ImpactError(404, 'Metric not found', 'NOT_FOUND');
    return this.formatMetric(metric);
  }

  static async createMetric(input: CreateImpactMetricInput): Promise<ImpactMetricResponse> {
    const metric = await prisma.impactMetric.create({
      data: {
        label: input.label,
        value: input.value,
        suffix: input.suffix,
        description: input.description,
        order: input.order ?? 0,
      },
    });
    return this.formatMetric(metric);
  }

  static async updateMetric(id: string, input: UpdateImpactMetricInput): Promise<ImpactMetricResponse> {
    const existing = await prisma.impactMetric.findUnique({ where: { id } });
    if (!existing) throw new ImpactError(404, 'Metric not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.label !== undefined) updateData.label = input.label;
    if (input.value !== undefined) updateData.value = input.value;
    if (input.suffix !== undefined) updateData.suffix = input.suffix;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.order !== undefined) updateData.order = input.order;

    const metric = await prisma.impactMetric.update({
      where: { id },
      data: updateData,
    });
    return this.formatMetric(metric);
  }

  static async deleteMetric(id: string): Promise<void> {
    const existing = await prisma.impactMetric.findUnique({ where: { id } });
    if (!existing) throw new ImpactError(404, 'Metric not found', 'NOT_FOUND');

    await prisma.impactMetric.delete({ where: { id } });
  }

  static async reorderMetrics(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.impactMetric.updateMany({
        where: { id: orderedIds[i] },
        data: { order: i },
      });
    }
  }

  // ─── STORIES ──────────────────────────────────────────────────

  static async listStories(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ stories: ImpactStoryResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [total, stories] = await Promise.all([
      prisma.impactStory.count({ where }),
      prisma.impactStory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      stories: stories.map(this.formatStory),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  static async getStory(id: string): Promise<ImpactStoryResponse> {
    const story = await prisma.impactStory.findUnique({ where: { id } });
    if (!story) throw new ImpactError(404, 'Story not found', 'NOT_FOUND');
    return this.formatStory(story);
  }

  static async createStory(input: CreateImpactStoryInput): Promise<ImpactStoryResponse> {
    const story = await prisma.impactStory.create({
      data: {
        title: input.title,
        description: input.description,
        personName: input.personName,
        personRole: input.personRole,
        imageUrl: input.imageUrl,
        status: (input.status as ContentStatus) || 'draft',
      },
    });
    return this.formatStory(story);
  }

  static async updateStory(id: string, input: UpdateImpactStoryInput): Promise<ImpactStoryResponse> {
    const existing = await prisma.impactStory.findUnique({ where: { id } });
    if (!existing) throw new ImpactError(404, 'Story not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.personName !== undefined) updateData.personName = input.personName;
    if (input.personRole !== undefined) updateData.personRole = input.personRole;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.status !== undefined) updateData.status = input.status;

    const story = await prisma.impactStory.update({
      where: { id },
      data: updateData,
    });
    return this.formatStory(story);
  }

  static async deleteStory(id: string): Promise<void> {
    const existing = await prisma.impactStory.findUnique({ where: { id } });
    if (!existing) throw new ImpactError(404, 'Story not found', 'NOT_FOUND');

    await prisma.impactStory.delete({ where: { id } });
  }
}
