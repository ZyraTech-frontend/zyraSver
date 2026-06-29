// Projects Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectResponse,
  ProjectError,
} from './types';
import { ContentStatus } from '@prisma/client';

export class ProjectsService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(project: any): ProjectResponse {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      coverImageUrl: project.coverImageUrl,
      technologies: project.technologies || [],
      clientName: project.clientName,
      status: project.status,
      completedAt: project.completedAt ? project.completedAt.toISOString() : null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  // ─── List Projects ────────────────────────────────────────────

  static async listProjects(
    page: number = 1,
    limit: number = 20,
    status?: string,
    technology?: string,
    search?: string
  ): Promise<{ projects: ProjectResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (status) where.status = status;
    if (technology) {
      where.technologies = { has: technology };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      projects: projects.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── Get Single Project ───────────────────────────────────────

  static async getProject(idOrSlug: string): Promise<ProjectResponse> {
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });

    if (!project) throw new ProjectError(404, 'Project not found', 'NOT_FOUND');
    return this.format(project);
  }

  // ─── Create Project ───────────────────────────────────────────

  static async createProject(input: CreateProjectInput): Promise<ProjectResponse> {
    // Check slug uniqueness
    const existing = await prisma.project.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new ProjectError(400, 'Slug already exists. Please choose a unique slug.', 'SLUG_EXISTS');
    }

    const project = await prisma.project.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        technologies: input.technologies || [],
        clientName: input.clientName,
        status: (input.status as ContentStatus) || 'draft',
        completedAt: input.completedAt ? new Date(input.completedAt) : null,
      },
    });

    return this.format(project);
  }

  // ─── Update Project ───────────────────────────────────────────

  static async updateProject(id: string, input: UpdateProjectInput): Promise<ProjectResponse> {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new ProjectError(404, 'Project not found', 'NOT_FOUND');

    // Check slug uniqueness if updating
    if (input.slug && input.slug !== existing.slug) {
      const slugExists = await prisma.project.findUnique({ where: { slug: input.slug } });
      if (slugExists) {
        throw new ProjectError(400, 'Slug already exists. Please choose a unique slug.', 'SLUG_EXISTS');
      }
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl;
    if (input.technologies !== undefined) updateData.technologies = input.technologies;
    if (input.clientName !== undefined) updateData.clientName = input.clientName;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.completedAt !== undefined) {
      updateData.completedAt = input.completedAt ? new Date(input.completedAt) : null;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return this.format(project);
  }

  // ─── Delete Project ───────────────────────────────────────────

  static async deleteProject(id: string): Promise<void> {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new ProjectError(404, 'Project not found', 'NOT_FOUND');

    await prisma.project.delete({ where: { id } });
  }
}
