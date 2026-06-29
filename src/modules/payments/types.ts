// Payments Module - Type Definitions

export interface InitializePaymentInput {
  courseId: string;
  applicationId?: string; // Optional reference to the training application
  studentName: string;
  studentEmail: string;
  amount: number;
}

export interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentResponse {
  id: string;
  reference: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface WebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

export class PaymentError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}
