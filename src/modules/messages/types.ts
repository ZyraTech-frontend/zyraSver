// Messages Module - Type Definitions

export interface CreateMessageInput {
  sender: string;
  email: string;
  subject?: string;
  content: string;
}

export interface MessageResponse {
  id: string;
  sender: string;
  email: string;
  subject: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export class MessageError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'MessageError';
  }
}
