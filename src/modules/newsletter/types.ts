// Newsletter Module - Type Definitions

export interface SubscribeNewsletterInput {
  email: string;
  name?: string;
}

export interface NewsletterSubscriberResponse {
  id: string;
  email: string;
  name: string | null;
  status: string; // subscribed | unsubscribed
  createdAt: string;
  updatedAt: string;
}

export class NewsletterError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'NewsletterError';
  }
}
