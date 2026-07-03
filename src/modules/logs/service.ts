// Logs Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import { ActivityLogResponse } from './types';

export class LogsService {
  // ─── Format Response ──────────────────────────────────────────

  private static format(log: any): ActivityLogResponse {
    return {
      id: log.id,
      userId: log.userId,
      user: log.user ? {
        name: log.user.name,
        email: log.user.email,
      } : null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      changes: log.changes,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt.toISOString(),
    };
  }

  // ─── Admin: List Logs ─────────────────────────────────────────

  static async listLogs(
    page: number = 1,
    limit: number = 50,
    action?: string,
    entity?: string,
    userId?: string
  ): Promise<{ logs: ActivityLogResponse[]; total: number; pages: number }> {
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      logs: logs.map(this.format),
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
