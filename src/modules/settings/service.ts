// Settings Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import { UpdateSettingInput, SettingResponse } from './types';

// Categories considered public
const PUBLIC_CATEGORIES = ['contact', 'social', 'features', 'metadata', 'business'];

export class SettingsService {
  // ─── Format Response ──────────────────────────────────────────
  private static format(setting: any): SettingResponse {
    let parsedValue = setting.value;
    try {
      parsedValue = JSON.parse(setting.value);
    } catch {
      // Keep as string if it fails to parse
    }

    return {
      id: setting.id,
      category: setting.category,
      key: setting.key,
      value: parsedValue,
      updatedAt: setting.updatedAt.toISOString(),
    };
  }

  // ─── Admin: List All Settings ─────────────────────────────────
  static async listAllSettings(category?: string): Promise<SettingResponse[]> {
    const where = category ? { category } : {};
    const settings = await prisma.setting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    return settings.map(this.format);
  }

  // ─── Public: List Public Settings ─────────────────────────────
  static async listPublicSettings(): Promise<Record<string, any>> {
    const settings = await prisma.setting.findMany({
      where: {
        category: {
          in: PUBLIC_CATEGORIES,
        },
      },
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      if (!result[setting.category]) {
        result[setting.category] = {};
      }
      
      let parsedValue = setting.value;
      try {
        parsedValue = JSON.parse(setting.value);
      } catch {
        // Keep as string if parsing fails
      }
      
      result[setting.category][setting.key] = parsedValue;
    }
    
    return result;
  }

  // ─── Admin: Upsert Setting ────────────────────────────────────
  static async upsertSetting(input: UpdateSettingInput, userId?: string): Promise<SettingResponse> {
    const stringifiedValue = typeof input.value === 'string' ? input.value : JSON.stringify(input.value);
    
    const setting = await prisma.setting.upsert({
      where: {
        category_key: {
          category: input.category,
          key: input.key,
        },
      },
      create: {
        category: input.category,
        key: input.key,
        value: stringifiedValue,
        updatedBy: userId,
      },
      update: {
        value: stringifiedValue,
        updatedBy: userId,
      },
    });

    return this.format(setting);
  }

  // ─── Admin: Bulk Upsert Settings ──────────────────────────────
  static async bulkUpsertSettings(settings: UpdateSettingInput[], userId?: string): Promise<SettingResponse[]> {
    const results: SettingResponse[] = [];

    // Process sequentially to handle upserts safely
    for (const input of settings) {
      const stringifiedValue = typeof input.value === 'string' ? input.value : JSON.stringify(input.value);

      const setting = await prisma.setting.upsert({
        where: {
          category_key: {
            category: input.category,
            key: input.key,
          },
        },
        create: {
          category: input.category,
          key: input.key,
          value: stringifiedValue,
          updatedBy: userId,
        },
        update: {
          value: stringifiedValue,
          updatedBy: userId,
        },
      });
      results.push(this.format(setting));
    }

    return results;
  }
}
