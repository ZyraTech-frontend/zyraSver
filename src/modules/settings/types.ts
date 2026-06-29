// Settings Module - Type Definitions

export interface UpdateSettingInput {
  category: string;
  key: string;
  value: string; // Will be stored as JSON string
}

export interface SettingResponse {
  id: string;
  category: string;
  key: string;
  value: any; // Parsed JSON
  updatedAt: string;
}

export class SettingsError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'SettingsError';
  }
}
