// Training Courses Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import { CreateCourseInput, UpdateCourseInput, CourseResponse, CourseError } from './types';

export class TrainingCoursesService {
  // ─── Format Course Response ───────────────────────────────────
  private static format(course: any): CourseResponse {
    return {
      id: course.id,
      title: course.title,
      category: course.category,
      duration: course.duration,
      level: course.level,
      price: course.price,
      description: course.description ?? null,
      topics: course.topics || [],
      instructor: course.instructor ?? null,
      format: course.format ?? null,
      status: course.status,
      enrollments: course.enrollmentCount, // rename for frontend
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  // ─── List Courses (Admin) ─────────────────────────────────────
  static async listCourses(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
    status?: string
  ): Promise<{
    courses: CourseResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, courses] = await Promise.all([
      prisma.trainingCourse.count({ where }),
      prisma.trainingCourse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      courses: courses.map(this.format),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── List Courses (Public) ────────────────────────────────────
  static async listPublicCourses(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<{
    courses: CourseResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where: any = { status: 'active' };
    if (category) where.category = category;

    const [total, courses] = await Promise.all([
      prisma.trainingCourse.count({ where }),
      prisma.trainingCourse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ category: 'asc' }, { title: 'asc' }],
      }),
    ]);

    return {
      courses: courses.map(this.format),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get Single Course ────────────────────────────────────────
  static async getCourseById(id: string): Promise<CourseResponse> {
    const course = await prisma.trainingCourse.findUnique({ where: { id } });
    if (!course) throw new CourseError(404, 'Course not found', 'NOT_FOUND');
    return this.format(course);
  }

  // ─── Create Course ────────────────────────────────────────────
  static async createCourse(input: CreateCourseInput): Promise<CourseResponse> {
    const course = await prisma.trainingCourse.create({
      data: {
        title: input.title,
        category: input.category,
        duration: input.duration,
        level: input.level,
        price: input.price,
        description: input.description,
        topics: input.topics || [],
        instructor: input.instructor,
        format: input.format,
        status: 'draft',
      },
    });

    return this.format(course);
  }

  // ─── Update Course ────────────────────────────────────────────
  static async updateCourse(id: string, input: UpdateCourseInput): Promise<CourseResponse> {
    const existing = await prisma.trainingCourse.findUnique({ where: { id } });
    if (!existing) throw new CourseError(404, 'Course not found', 'NOT_FOUND');

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.level !== undefined) updateData.level = input.level;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.topics !== undefined) updateData.topics = input.topics;
    if (input.instructor !== undefined) updateData.instructor = input.instructor;
    if (input.format !== undefined) updateData.format = input.format;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await prisma.trainingCourse.update({ where: { id }, data: updateData });
    return this.format(updated);
  }

  // ─── Delete Course ────────────────────────────────────────────
  static async deleteCourse(id: string): Promise<void> {
    const existing = await prisma.trainingCourse.findUnique({ where: { id } });
    if (!existing) throw new CourseError(404, 'Course not found', 'NOT_FOUND');

    // Check for active applications before deleting
    const applicationCount = await prisma.trainingApplication.count({
      where: { courseId: id, status: 'pending' },
    });
    if (applicationCount > 0) {
      throw new CourseError(
        409,
        `Cannot delete course with ${applicationCount} pending application(s). Please resolve them first.`,
        'CONFLICT'
      );
    }

    await prisma.trainingCourse.delete({ where: { id } });
  }
}
