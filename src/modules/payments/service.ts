// Payments Module - Business Logic Service

import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../../shared/config/database';
import {
  InitializePaymentInput,
  PaystackInitializeResponse,
  PaymentResponse,
  WebhookEvent,
  PaymentError,
} from './types';

export class PaymentsService {
  private static get paystackSecretKey(): string {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new Error('PAYSTACK_SECRET_KEY is not defined in environment');
    return key;
  }

  // ─── Format Payment Response ──────────────────────────────────
  private static format(payment: any): PaymentResponse {
    return {
      id: payment.id,
      reference: payment.reference,
      courseTitle: payment.course?.title || 'Unknown Course',
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt.toISOString(),
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    };
  }

  // ─── Generate Reference ───────────────────────────────────────
  private static generateReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ZT-';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ─── Initialize Payment ───────────────────────────────────────
  static async initializePayment(
    input: InitializePaymentInput
  ): Promise<{ authorizationUrl: string; reference: string }> {
    const course = await prisma.trainingCourse.findUnique({
      where: { id: input.courseId },
    });
    if (!course) throw new PaymentError(404, 'Course not found', 'NOT_FOUND');

    const reference = this.generateReference();
    const amountInPesewas = Math.round(input.amount * 100);

    // Create pending payment record
    await prisma.payment.create({
      data: {
        courseId: input.courseId,
        applicationId: input.applicationId || null,
        studentName: input.studentName,
        studentEmail: input.studentEmail,
        amount: input.amount,
        reference,
        status: 'pending',
      },
    });

    // Call Paystack API
    try {
      const response = await axios.post<PaystackInitializeResponse>(
        'https://api.paystack.co/transaction/initialize',
        {
          email: input.studentEmail,
          amount: amountInPesewas,
          reference,
          currency: 'GHS',
          callback_url: `${process.env.VITE_API_BASE_URL || 'https://zyratechhub.com'}/payment/verify`,
          metadata: {
            courseId: input.courseId,
            applicationId: input.applicationId,
            studentName: input.studentName,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Axios wraps JSON in `.data` but Paystack response is `{ status, message, data: { ... } }`
      const paystackData = (response.data as any).data;

      return {
        authorizationUrl: paystackData.authorization_url,
        reference,
      };
    } catch (error: any) {
      console.error('Paystack Initialization Error:', error.response?.data || error.message);
      
      // Delete the pending record if Paystack fails
      await prisma.payment.delete({ where: { reference } });
      
      throw new PaymentError(
        500,
        'Failed to initialize payment gateway. Please try again later.',
        'PAYGATE_ERROR'
      );
    }
  }

  // ─── Verify Payment (Frontend Callback) ───────────────────────
  static async verifyPayment(reference: string): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { course: { select: { title: true } } },
    });

    if (!payment) throw new PaymentError(404, 'Payment reference not found', 'NOT_FOUND');

    // If already verified via webhook, just return
    if (payment.status === 'completed') return this.format(payment);

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.paystackSecretKey}` },
        }
      );

      const paystackData = (response.data as any).data;

      if (paystackData.status === 'success') {
        const updated = await prisma.payment.update({
          where: { reference },
          data: {
            status: 'completed',
            paidAt: new Date(paystackData.paid_at || new Date()),
            paymentMethod: paystackData.channel,
            paystackResponse: JSON.stringify(paystackData),
          },
          include: { course: { select: { title: true } } },
        });
        return this.format(updated);
      } else if (paystackData.status === 'failed') {
        const updated = await prisma.payment.update({
          where: { reference },
          data: {
            status: 'failed',
            paystackResponse: JSON.stringify(paystackData),
          },
          include: { course: { select: { title: true } } },
        });
        return this.format(updated);
      }

      // Still pending in Paystack
      return this.format(payment);
    } catch (error: any) {
      console.error('Paystack Verification Error:', error.response?.data || error.message);
      throw new PaymentError(500, 'Failed to verify payment with gateway', 'PAYGATE_ERROR');
    }
  }

  // ─── Webhook Processor ────────────────────────────────────────
  static async processWebhook(
    signature: string,
    rawBody: string
  ): Promise<void> {
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      throw new PaymentError(401, 'Invalid webhook signature', 'UNAUTHORIZED');
    }

    const event = JSON.parse(rawBody) as WebhookEvent;

    if (event.event === 'charge.success') {
      const { reference, channel, paid_at } = event.data;

      const payment = await prisma.payment.findUnique({ where: { reference } });
      if (payment && payment.status !== 'completed') {
        await prisma.payment.update({
          where: { reference },
          data: {
            status: 'completed',
            paidAt: new Date(paid_at || new Date()),
            paymentMethod: channel,
            paystackResponse: JSON.stringify(event.data),
          },
        });
      }
    }
  }

  // ─── List Payments (Admin) ────────────────────────────────────
  static async listPayments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{
    payments: PaymentResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { studentName: { contains: search, mode: 'insensitive' } },
        { studentEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { title: true } } },
      }),
    ]);

    return {
      payments: payments.map(this.format),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Issue Refund (Admin) ─────────────────────────────────────
  static async issueRefund(reference: string, reason: string): Promise<PaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { course: { select: { title: true } } },
    });

    if (!payment) throw new PaymentError(404, 'Payment not found', 'NOT_FOUND');
    if (payment.status !== 'completed') {
      throw new PaymentError(400, 'Can only refund completed payments', 'INVALID_STATE');
    }

    // Call Paystack Refund API
    try {
      await axios.post(
        'https://api.paystack.co/refund',
        {
          transaction: reference,
          merchant_note: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const updated = await prisma.payment.update({
        where: { reference },
        data: {
          status: 'refunded',
          refundReason: reason,
          refundMethod: 'paystack',
          refundedAt: new Date(),
        },
        include: { course: { select: { title: true } } },
      });

      return this.format(updated);
    } catch (error: any) {
      console.error('Paystack Refund Error:', error.response?.data || error.message);
      throw new PaymentError(500, 'Failed to process refund with gateway', 'PAYGATE_ERROR');
    }
  }
}
