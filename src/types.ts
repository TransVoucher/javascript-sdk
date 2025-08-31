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

/**
 * Request parameters for creating a payment link
 */
export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  title: string;  // Required - title of the payment link
  description?: string;
  reference_id?: string;
  multiple_use?: boolean;
  customer_details?: CustomerDetails;
  /**
   * Optional metadata object that can be used to send additional data that identifies 
   * the customer or payment session. This data will be returned in webhooks and API responses.
   */
  metadata?: Record<string, any>;
  expires_at?: string;
}

/**
 * Payment object returned by the API
 */
export interface Payment {
  id?: string;
  transaction_id?: string;
  title: string;  // Title is required when creating, always returned
  description?: string;
  reference_id?: string;
  payment_url?: string;
  amount?: number;
  currency?: string;
  status?: PaymentStatus;
  expires_at?: string;
  customer_commission_percentage?: number;
  multiple_use?: boolean;
  created_at?: string;
  updated_at?: string;
  paid_at?: string;
  customer_details?: CustomerDetails;
  /**
   * Metadata provided during payment link creation. Can be used to identify 
   * the customer or payment session when webhooks are received or when 
   * payment/transaction data is loaded from the API.
   */
  metadata?: Record<string, any>;
  payment_details?: Record<string, any>;
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

export interface TransactionData {
  id: string;
  reference_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface SalesChannelData {
  id: string;
  name: string;
  type: string;
}

export interface MerchantData {
  id: string;
  name: string;
  company_name: string;
}

export interface WebhookEvent {
  event: WebhookEventType;  // This is the event type
  timestamp: string;
  data: {
    transaction: TransactionData;
    sales_channel: SalesChannelData;
    merchant: MerchantData;
    payment_details: Record<string, any>;
    customer_details?: CustomerDetails;
    metadata?: Record<string, any>;
  };
}

export interface CustomerDetails {
  full_name?: string;           // Required
  first_name: string;          // Required
  middle_name?: string;        // Required
  last_name: string;           // Required
  id?: string;                 // Optional - Customer's unique identifier
  email?: string;              // Optional
  phone?: string;              // Optional
  date_of_birth?: string;      // Optional - Format: YYYY-MM-DD
  country_of_residence?: string; // Optional - ISO country code (e.g., 'US', 'GB')
  state_of_residence?: string;  // Optional - Required if country_of_residence is 'US'
  [key: string]: any;         // Allow additional fields
}

export type WebhookEventType = 
  | 'payment_intent.created'
  | 'payment_intent.processing'
  | 'payment_intent.succeeded'
  | 'payment_intent.failed'
  | 'payment_intent.cancelled'
  | 'payment_intent.expired';

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