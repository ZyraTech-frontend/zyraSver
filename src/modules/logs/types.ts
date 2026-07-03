// Logs Module - Type Definitions

export interface ActivityLogResponse {
  id: string;
  userId: string | null;
  user: {
    name: string;
    email: string;
  } | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}
