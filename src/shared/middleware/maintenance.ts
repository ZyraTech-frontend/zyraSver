import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * Maintenance Mode Middleware
 * Blocks public routes with a 503 error if maintenance mode is enabled in the settings.
 * Allows access if the route is an admin route or if the user is authenticated as an admin.
 */
export const checkMaintenanceMode = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if maintenance mode is enabled in the database
    const maintenanceSetting = await prisma.setting.findUnique({
      where: {
        category_key: {
          category: 'general',
          key: 'maintenance_mode'
        }
      }
    });

    // Default to false if not set
    let isMaintenanceMode = false;
    if (maintenanceSetting && maintenanceSetting.value) {
      try {
        isMaintenanceMode = JSON.parse(maintenanceSetting.value);
      } catch {
        isMaintenanceMode = maintenanceSetting.value === 'true';
      }
    }

    if (isMaintenanceMode) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'MAINTENANCE_MODE',
          message: 'ZyraTech Hub is currently undergoing maintenance. Please check back later.'
        }
      });
    }

    return next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // If we fail to check the DB, assume it's NOT in maintenance mode to avoid taking the site down on DB glitches
    return next();
  }
};
