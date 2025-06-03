/**
 * TransVoucher SDK Types
 */

export interface TransVoucherConfig {
  apiKey: string;
  environment?: 'sandbox' | 'production';
  baseUrl?: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta?: PaginationMeta;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  customer_email?: string;
  customer_name?: string;
  webhook_url?: string;
  redirect_url?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference?: string;
  description?: string;
  customer_email?: string;
  customer_name?: string;
  webhook_url?: string;
  redirect_url?: string;
  payment_url?: string;
  qr_code?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing' 
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface PaymentListRequest {
  page?: number;
  per_page?: number;
  status?: PaymentStatus;
  currency?: string;
  from_date?: string;
  to_date?: string;
  reference?: string;
  customer_email?: string;
}

export interface PaymentList {
  payments: Payment[];
  meta: PaginationMeta;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Payment;
  created_at: string;
}

export type WebhookEventType = 
  | 'payment.created'
  | 'payment.processing'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.expired'
  | 'payment.cancelled';

export interface WebhookVerificationResult {
  isValid: boolean;
  event?: WebhookEvent;
  error?: string;
}

export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

export class TransVoucherError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly response?: any;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    response?: any
  ) {
    super(message);
    this.name = 'TransVoucherError';
    this.code = code;
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class ValidationError extends TransVoucherError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    errors: Record<string, string[]>,
    statusCode?: number,
    response?: any
  ) {
    super(message, 'VALIDATION_ERROR', statusCode, response);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends TransVoucherError {
  constructor(message: string = 'Authentication failed', statusCode?: number, response?: any) {
    super(message, 'AUTHENTICATION_ERROR', statusCode, response);
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends TransVoucherError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, 'API_ERROR', statusCode, response);
    this.name = 'ApiError';
  }
}

export class NetworkError extends TransVoucherError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
} 